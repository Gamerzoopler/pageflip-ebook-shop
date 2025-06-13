
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PurchaseRequest {
  ebookId: string;
  paymentMethod: 'paypal' | 'stripe';
  paymentDetails: any;
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

    const { ebookId, paymentMethod, paymentDetails }: PurchaseRequest = await req.json();

    // Get ebook details
    const { data: ebook, error: ebookError } = await supabaseClient
      .from('ebooks')
      .select('*')
      .eq('id', ebookId)
      .single();

    if (ebookError || !ebook) {
      throw new Error('Ebook not found');
    }

    // Check if user already owns this ebook
    const { data: existingDownload } = await supabaseClient
      .from('user_downloads')
      .select('id')
      .eq('user_id', user.id)
      .eq('ebook_id', ebookId)
      .single();

    if (existingDownload) {
      return new Response(JSON.stringify({
        success: true,
        message: 'You already own this ebook',
        alreadyOwned: true,
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Create order record
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        customer_id: user.id,
        total_amount: ebook.price,
        payment_method: paymentMethod,
        status: 'completed',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Failed to create order:', orderError);
      throw new Error('Failed to create order');
    }

    // Create order item
    const { error: orderItemError } = await supabaseClient
      .from('order_items')
      .insert({
        order_id: order.id,
        ebook_id: ebookId,
        price: ebook.price,
      });

    if (orderItemError) {
      console.error('Failed to create order item:', orderItemError);
    }

    // Add to user downloads
    const { error: downloadError } = await supabaseClient
      .from('user_downloads')
      .insert({
        user_id: user.id,
        ebook_id: ebookId,
      });

    if (downloadError) {
      console.error('Failed to add download record:', downloadError);
      throw new Error('Failed to add download record');
    }

    console.log('Purchase processed successfully for user:', user.id, 'ebook:', ebookId);

    return new Response(JSON.stringify({
      success: true,
      orderId: order.id,
      message: 'Purchase completed successfully',
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error processing purchase:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
