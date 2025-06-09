
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
    )

    // Get total downloads per ebook
    const { data: downloadStats, error: statsError } = await supabaseClient
      .from('user_downloads')
      .select(`
        ebook_id,
        ebooks!inner(title, author),
        downloaded_at
      `)

    if (statsError) {
      throw statsError
    }

    // Process analytics data
    const ebookDownloads = downloadStats.reduce((acc: any, download) => {
      const ebookId = download.ebook_id
      if (!acc[ebookId]) {
        acc[ebookId] = {
          ebook: download.ebooks,
          downloadCount: 0,
          recentDownloads: []
        }
      }
      acc[ebookId].downloadCount++
      acc[ebookId].recentDownloads.push(download.downloaded_at)
      return acc
    }, {})

    // Sort by download count
    const topDownloads = Object.values(ebookDownloads)
      .sort((a: any, b: any) => b.downloadCount - a.downloadCount)
      .slice(0, 10)

    const totalDownloads = downloadStats.length
    const totalBooks = Object.keys(ebookDownloads).length

    console.log(`Analytics generated: ${totalDownloads} total downloads across ${totalBooks} books`)

    return new Response(
      JSON.stringify({ 
        totalDownloads,
        totalBooks,
        topDownloads,
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-analytics function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
