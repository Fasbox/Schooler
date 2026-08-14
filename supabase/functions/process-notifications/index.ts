// Supabase Edge Function programable. Secrets requeridos:
// SCHOOLER_API_CRON_URL y SCHOOLER_CRON_SECRET.
Deno.serve(async () => {
  const url = Deno.env.get('SCHOOLER_API_CRON_URL');
  const secret = Deno.env.get('SCHOOLER_CRON_SECRET');
  if (!url || !secret) return new Response('Missing notification processor secrets', { status: 500 });
  const response = await fetch(url, { method: 'POST', headers: { 'x-cron-secret': secret } });
  return new Response(await response.text(), { status: response.status, headers: { 'content-type': 'application/json' } });
});
