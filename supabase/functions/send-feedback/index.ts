import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Decrypt password function
function decryptPassword(encryptedPassword: string): string {
  try {
    return atob(encryptedPassword);
  } catch (error) {
    console.error("Error decrypting password:", error);
    throw new Error("Failed to decrypt SMTP password");
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Send feedback function called");
    
    const authHeader = req.headers.get('Authorization');
    console.log("Auth header present:", !!authHeader);
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("User fetch error:", userError);
      throw new Error('Unauthorized');
    }

    console.log("User authenticated:", user.email);

    const { feedback } = await req.json();

    if (!feedback || typeof feedback !== 'string' || feedback.trim().length === 0) {
      throw new Error('Feedback message is required');
    }

    if (feedback.length > 5000) {
      throw new Error('Feedback message too long (max 5000 characters)');
    }

    console.log("Feedback received from:", user.email);

    // Get SMTP credentials
    const { data: smtpData, error: smtpError } = await supabase
      .from('smtp_credentials')
      .select('email, encrypted_password')
      .eq('user_id', user.id)
      .single();

    if (smtpError || !smtpData) {
      console.error("SMTP fetch error:", smtpError);
      throw new Error('SMTP credentials not configured');
    }

    console.log("SMTP credentials retrieved");

    const decryptedPassword = decryptPassword(smtpData.encrypted_password);

    // Initialize SMTP client
    const smtpClient = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: smtpData.email,
          password: decryptedPassword,
        },
      },
    });

    console.log("Sending feedback email...");

    await smtpClient.send({
      from: smtpData.email,
      to: "manickavasagan022@gmail.com",
      subject: `Feedback from ${user.email}`,
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Feedback Received</h2>
          <p><strong>From:</strong> ${user.email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <h3>Feedback:</h3>
          <p style="white-space: pre-wrap;">${feedback}</p>
        </div>
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Feedback Received</h2>
          <p><strong>From:</strong> ${user.email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <h3>Feedback:</h3>
          <p style="white-space: pre-wrap;">${feedback}</p>
        </div>
      `,
    });

    await smtpClient.close();

    console.log("Feedback email sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: 'Feedback sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in send-feedback:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
