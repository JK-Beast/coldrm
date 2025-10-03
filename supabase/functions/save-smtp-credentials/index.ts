import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple encryption using base64 (in production, use proper encryption like AES)
function encryptPassword(password: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  return btoa(String.fromCharCode(...data));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, appPassword } = await req.json();

    if (!email || !appPassword) {
      return new Response(
        JSON.stringify({ error: "Email and app password are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
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

    // Encrypt the password
    const encryptedPassword = encryptPassword(appPassword);

    // Check if credentials already exist
    const { data: existing } = await supabase
      .from('smtp_credentials')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Update existing credentials
      const { error: updateError } = await supabase
        .from('smtp_credentials')
        .update({
          email,
          encrypted_password: encryptedPassword,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;
    } else {
      // Insert new credentials
      const { error: insertError } = await supabase
        .from('smtp_credentials')
        .insert({
          user_id: user.id,
          email,
          encrypted_password: encryptedPassword,
        });

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, message: "SMTP credentials saved securely" }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error saving SMTP credentials:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});