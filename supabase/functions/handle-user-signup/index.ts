
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface WebhookPayload {
  type: string;
  event: string;
  data: {
    id: string;
    email: string;
    user_metadata: {
      full_name?: string;
    };
    created_at: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: WebhookPayload = await req.json();
    console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

    if (payload.type === 'user' && payload.event === 'user.created') {
      const { id, email, user_metadata } = payload.data;
      
      console.log('Processing new user signup:', { id, email });

      // Create user profile
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          id,
          email,
          full_name: user_metadata?.full_name || email.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      console.log('User profile created successfully for:', email);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'User profile created successfully' 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Webhook received but no action taken' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in user signup webhook:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
