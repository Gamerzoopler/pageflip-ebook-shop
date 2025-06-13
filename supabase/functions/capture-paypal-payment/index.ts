
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CapturePaymentRequest {
  orderId: string;
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

    const { orderId, ebookId }: CapturePaymentRequest = await req.json();

    // Get PayPal access token
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('PayPal credentials not configured');
    }

    const auth = btoa(`${clientId}:${clientSecret}`);
    
    const tokenResponse = await fetch('https://api.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Capture PayPal payment
    const captureResponse = await fetch(`https://api.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureResponse.json();

    if (!captureResponse.ok) {
      console.error('PayPal capture failed:', captureData);
      throw new Error('Failed to capture PayPal payment');
    }

    // Update order status and create user download record
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ status: 'completed' })
      .eq('customer_id', user.id)
      .eq('payment_method', 'paypal');

    if (updateError) {
      console.error('Failed to update order:', updateError);
    }

    // Add to user downloads
    const { error: downloadError } = await supabaseClient
      .from('user_downloads')
      .upsert({
        user_id: user.id,
        ebook_id: ebookId,
      });

    if (downloadError) {
      console.error('Failed to add download record:', downloadError);
    }

    console.log('PayPal payment captured successfully:', captureData.id);

    return new Response(JSON.stringify({
      success: true,
      captureId: captureData.id,
      status: captureData.status,
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
