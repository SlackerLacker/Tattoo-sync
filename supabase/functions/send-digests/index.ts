import { createClient } from "npm:@supabase/supabase-js@2.35.0";
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CRON_SECRET = Deno.env.get('CRON_SECRET') || '';
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) console.error('Missing Supabase env vars');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
Deno.serve(async (req: Request) => {
  try {
    // simple secret header check
    const secret = req.headers.get('x-cron-secret') || '';
    if (CRON_SECRET && secret !== CRON_SECRET) return new Response('unauthorized', { status: 401 });

    // Query unread conversations with last_message_at older than 1 hour and not reminded
    // Assumptions: tables: conversations(id), messages(conversation_id, created_at, is_read boolean), reminders(conversation_id)
    // We'll select conversations where exists an unread message older than 1 hour and no reminder sent yet
    const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60).toISOString();

    const { data: convs, error } = await supabase
      .rpc('get_conversations_to_remind', { older_than: oneHourAgo });

    if (error) throw error;

    // Process each conversation: create reminder record and perform send (stubbed)
    for (const c of convs || []) {
      // stub: perform external send (email, webhook, push)
      // Example: POST to webhook stored on conversations table
      try {
        await fetch(c.webhook_url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversation_id: c.id }) });
      } catch (e) {
        console.error('send failed', e);
      }

      // record reminder
      await supabase.from('message_reminders').insert([{ conversation_id: c.id, reminded_at: new Date().toISOString() }]);
    }

    return new Response(JSON.stringify({ processed: convs?.length || 0 }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message || err }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});