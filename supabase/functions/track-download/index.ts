
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { ebookId } = await req.json()

    if (!ebookId) {
      return new Response(
        JSON.stringify({ error: 'Missing ebookId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Track the download
    const { error: downloadError } = await supabaseClient
      .from('user_downloads')
      .upsert({
        user_id: user.id,
        ebook_id: ebookId,
      })

    if (downloadError) {
      console.error('Error tracking download:', downloadError)
      return new Response(
        JSON.stringify({ error: 'Failed to track download' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get download analytics
    const { data: downloadCount } = await supabaseClient
      .from('user_downloads')
      .select('id', { count: 'exact' })
      .eq('ebook_id', ebookId)

    console.log(`Download tracked for ebook ${ebookId} by user ${user.id}`)
    console.log(`Total downloads for this ebook: ${downloadCount?.length || 0}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Download tracked successfully',
        totalDownloads: downloadCount?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in track-download function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
