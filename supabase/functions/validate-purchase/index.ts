
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidatePurchaseRequest {
  ebookId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { ebookId }: ValidatePurchaseRequest = await req.json();

    // Check if user has purchased this ebook
    const { data: userDownload, error: downloadError } = await supabaseClient
      .from('user_downloads')
      .select('*')
      .eq('user_id', user.id)
      .eq('ebook_id', ebookId)
      .single();

    if (downloadError && downloadError.code !== 'PGRST116') {
      console.error('Error checking user download:', downloadError);
      throw new Error('Failed to validate purchase');
    }

    const hasPurchased = !!userDownload;

    console.log('Purchase validation for user:', user.id, 'ebook:', ebookId, 'result:', hasPurchased);

    return new Response(JSON.stringify({
      hasPurchased,
      downloadedAt: userDownload?.downloaded_at || null,
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error validating purchase:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
