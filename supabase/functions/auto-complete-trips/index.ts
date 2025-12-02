/**
 * Supabase Edge Function: Auto-Complete Business Trips
 * 
 * This function is triggered by cron job to automatically complete
 * todos linked to expired business trips.
 * 
 * Schedule: Daily at 02:00 WIB (19:00 UTC previous day)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Starting auto-complete business trips...');
    const startTime = Date.now();

    // Call the database function
    const { data, error } = await supabaseClient
      .rpc('auto_complete_business_trips');

    if (error) {
      console.error('Auto-complete error:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const executionTime = Date.now() - startTime;
    console.log(`Auto-complete completed in ${executionTime}ms`);
    console.log('Results:', data);

    // Calculate summary
    const summary = {
      events_processed: data?.length || 0,
      todos_completed: data?.reduce((sum: number, r: any) => 
        sum + (r.todos_completed || 0), 0) || 0,
      successful: data?.filter((r: any) => r.status === 'success').length || 0,
      partial: data?.filter((r: any) => r.status === 'partial').length || 0,
      failed: data?.filter((r: any) => r.status === 'failed').length || 0,
    };

    // Broadcast real-time update to connected clients
    try {
      const channel = supabaseClient.channel('calendar-updates');
      await channel.send({
        type: 'broadcast',
        event: 'todos-auto-completed',
        payload: { 
          results: data,
          summary,
          timestamp: new Date().toISOString()
        }
      });
      console.log('Broadcast sent successfully');
    } catch (broadcastError) {
      console.error('Broadcast error:', broadcastError);
      // Don't fail the function if broadcast fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          summary,
          events: data,
          execution_time_ms: executionTime
        },
        timestamp: new Date().toISOString(),
        message: `Auto-completed ${summary.todos_completed} todos from ${summary.events_processed} events`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (err: any) {
    console.error('Function error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err.message || 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
