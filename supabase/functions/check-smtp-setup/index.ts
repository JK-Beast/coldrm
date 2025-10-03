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
    console.log("Check SMTP setup function called");
    
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    console.log("Auth header present:", !!authHeader);
    
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized", configured: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    console.log("User fetch result:", { userId: user?.id, error: userError?.message });

    if (userError || !user) {
      console.error("User authentication failed:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized", configured: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if credentials exist
    const { data, error } = await supabase
      .from('smtp_credentials')
      .select('email')
      .eq('user_id', user.id)
      .maybeSingle();

    console.log("SMTP credentials query result:", { data, error: error?.message });

    if (error) {
      console.error("Error querying SMTP credentials:", error);
      throw error;
    }

    const configured = !!data;
    console.log("Returning configured status:", configured);

    return new Response(
      JSON.stringify({ 
        configured,
        email: data?.email || null
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error checking SMTP setup:', error);
    return new Response(
      JSON.stringify({ error: error.message, configured: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});