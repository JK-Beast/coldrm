import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const cohereApiKey = Deno.env.get('COHERE_API_KEY');
    if (!cohereApiKey) {
      return new Response(
        JSON.stringify({ error: "Cohere API key not configured" }),
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

    // Generate AI content using Cohere Chat API
    const cohereResponse = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cohereApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command',
        message: `Write a professional, friendly cold email based on this request: ${prompt}\n\nThe email should:\n- Sound natural and human-written\n- Be concise and personalized\n- Include a clear call-to-action\n- Not be too salesy\n- Be warm and approachable\n\nProvide only the email content, no additional commentary.`,
        temperature: 0.8,
      }),
    });

    if (!cohereResponse.ok) {
      const errorText = await cohereResponse.text();
      console.error('Cohere API error:', errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate email content" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cohereData = await cohereResponse.json();
    const generatedContent = cohereData.text?.trim() || '';

    console.log('Generated email content length:', generatedContent.length);

    // Add CTA button to the email
    const emailWithCTA = `${generatedContent}\n\n---\n\nInterested? Click here to connect: ${supabaseUrl}/add-contact?email=${encodeURIComponent(user.email || '')}`;

    // Process each recipient with 1-minute delay
    const results = [];
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      
      try {
        // Store campaign in database
        const { error: insertError } = await supabase
          .from('email_campaigns')
          .insert({
            user_id: user.id,
            subject: subject,
            content: emailWithCTA,
            recipient_email: recipient,
            status: 'sent',
            sent_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Error storing campaign:', insertError);
          results.push({ email: recipient, status: 'failed', error: insertError.message });
        } else {
          console.log(`Campaign stored for: ${recipient}`);
          results.push({ email: recipient, status: 'sent' });
        }

        // Wait 1 minute before next email (except for the last one)
        if (i < recipients.length - 1) {
          console.log(`Waiting 60 seconds before next email...`);
          await new Promise(resolve => setTimeout(resolve, 60000));
        }
      } catch (error: any) {
        console.error(`Error processing ${recipient}:`, error);
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