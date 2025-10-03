import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, prompt, recipients } = await req.json();

    if (!subject || !prompt || !recipients || !Array.isArray(recipients)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing email campaign for user: ${user.email}`);

    // Get SMTP credentials
    const { data: smtpCreds, error: smtpError } = await supabase
      .from('smtp_credentials')
      .select('email, encrypted_password')
      .eq('user_id', user.id)
      .single();

    if (smtpError || !smtpCreds) {
      return new Response(
        JSON.stringify({ error: "SMTP credentials not configured. Please add your Google App Password in settings." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt password
    function decryptPassword(encrypted: string): string {
      const decoded = atob(encrypted);
      const bytes = new Uint8Array(decoded.length);
      for (let i = 0; i < decoded.length; i++) {
        bytes[i] = decoded.charCodeAt(i);
      }
      const decoder = new TextDecoder();
      return decoder.decode(bytes);
    }

    const smtpPassword = decryptPassword(smtpCreds.encrypted_password);

    // Initialize SMTP client
    const smtpClient = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 587,
        tls: true,
        auth: {
          username: smtpCreds.email,
          password: smtpPassword,
        },
      },
    });

    // Generate AI content using Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a professional email writer. Write natural, human-sounding cold emails that are concise, warm, and personalized with clear calls-to-action. Avoid being too salesy.'
          },
          {
            role: 'user',
            content: `Write a professional cold email based on this request: ${prompt}\n\nProvide only the email content, no additional commentary.`
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate email content" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices?.[0]?.message?.content?.trim() || '';

    console.log('Generated email content length:', generatedContent.length);

    // Process each recipient with 1-minute delay
    const results = [];
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      
      try {
        // Send email via SMTP
        await smtpClient.send({
          from: smtpCreds.email,
          to: recipient,
          subject: subject,
          content: generatedContent,
          html: generatedContent.replace(/\n/g, '<br>'),
        });

        console.log(`Email sent to ${recipient} via SMTP`);

        // Store campaign in database
        const { error: insertError } = await supabase
          .from('email_campaigns')
          .insert({
            user_id: user.id,
            subject: subject,
            content: generatedContent,
            recipient_email: recipient,
            status: 'sent',
            sent_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Error storing campaign:', insertError);
        }

        results.push({ email: recipient, status: 'sent' });

        // Wait 1 minute before next email (except for the last one)
        if (i < recipients.length - 1) {
          console.log(`Waiting 60 seconds before next email...`);
          await new Promise(resolve => setTimeout(resolve, 60000));
        }
      } catch (error: any) {
        console.error(`Error processing ${recipient}:`, error);
        
        // Store failed campaign
        await supabase
          .from('email_campaigns')
          .insert({
            user_id: user.id,
            subject: subject,
            content: generatedContent,
            recipient_email: recipient,
            status: 'failed',
            sent_at: new Date().toISOString(),
          });

        results.push({ email: recipient, status: 'failed', error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Campaign processed for ${recipients.length} recipients`,
        results: results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-cold-emails function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});