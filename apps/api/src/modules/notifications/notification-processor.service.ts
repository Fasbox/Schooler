import { getBogotaContext } from '@schooler/shared';
import webPush from 'web-push';
import { env } from '../../config/env.js';
import { createAdminClient } from '../../lib/supabase.js';

function configureWebPush() {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) return false;
  webPush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  return true;
}

async function generateDailySummaries(now: Date, onlyUserId?: string) {
  const context = getBogotaContext(now);
  if (context.minutes < 8 * 60) return 0;
  const db = createAdminClient();
  let periodsQuery = db.from('academic_periods').select('id,user_id').eq('status', 'current');
  if (onlyUserId) periodsQuery = periodsQuery.eq('user_id', onlyUserId);
  const { data: periods, error } = await periodsQuery;
  if (error) throw error;
  let created = 0;
  for (const period of periods ?? []) {
    const { data: subjects } = await db.from('subjects').select('id').eq('academic_period_id', period.id).eq('status', 'active');
    const subjectIds = (subjects ?? []).map((item) => item.id);
    let classes = 0; let dueToday = 0; let pending = 0; let important = 0;
    if (subjectIds.length > 0) {
      const [classResult, todayResult, pendingResult, importantResult] = await Promise.all([
        db.from('subject_schedules').select('id', { count: 'exact', head: true }).in('subject_id', subjectIds).eq('weekday', context.weekday),
        db.from('activities').select('id', { count: 'exact', head: true }).in('subject_id', subjectIds).eq('due_date', context.date).is('deleted_at', null).not('status', 'in', '(COMPLETED,CANCELLED)'),
        db.from('activities').select('id', { count: 'exact', head: true }).in('subject_id', subjectIds).is('deleted_at', null).not('status', 'in', '(COMPLETED,CANCELLED)'),
        db.from('activities').select('id', { count: 'exact', head: true }).in('subject_id', subjectIds).gte('percentage', 15).gte('due_date', context.date).lte('due_date', addDays(context.date, 7)).is('deleted_at', null).not('status', 'in', '(COMPLETED,CANCELLED)'),
      ]);
      classes = classResult.count ?? 0; dueToday = todayResult.count ?? 0; pending = pendingResult.count ?? 0; important = importantResult.count ?? 0;
    }
    const extra = important > 0 ? ` Además, tienes ${important} actividad${important === 1 ? '' : 'es'} de alto impacto próxima${important === 1 ? '' : 's'}.` : '';
    const { data } = await db.from('notifications').upsert({ user_id: period.user_id, title: 'Tu día', message: `Hoy tienes ${classes} clase${classes === 1 ? '' : 's'}, ${dueToday} entrega${dueToday === 1 ? '' : 's'} y ${pending} pendiente${pending === 1 ? '' : 's'}.${extra}`, type: 'DAILY_SUMMARY', scheduled_for: now.toISOString(), deduplication_key: `daily-summary:${context.date}` }, { onConflict: 'user_id,deduplication_key', ignoreDuplicates: true }).select('id');
    if (data?.length) created += 1;
  }
  return created;
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10);
}

export async function processNotifications(now = new Date(), onlyUserId?: string) {
  const summariesCreated = await generateDailySummaries(now, onlyUserId);
  const db = createAdminClient(); const pushEnabled = configureWebPush();
  let notificationsQuery = db.from('notifications').select('id,user_id,title,message,activity_id,subject_id').is('delivered_at', null).not('scheduled_for', 'is', null).lte('scheduled_for', now.toISOString()).order('scheduled_for').limit(200);
  if (onlyUserId) notificationsQuery = notificationsQuery.eq('user_id', onlyUserId);
  const { data: notifications, error } = await notificationsQuery;
  if (error) throw error;
  let pushed = 0; let failed = 0;
  for (const notification of notifications ?? []) {
    if (pushEnabled) {
      const { data: subscriptions } = await db.from('push_subscriptions').select('id,endpoint,p256dh,auth_key').eq('user_id', notification.user_id);
      for (const subscription of subscriptions ?? []) {
        try {
          await webPush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth_key } }, JSON.stringify({ title: notification.title, body: notification.message, url: notification.activity_id ? '/activities' : '/' }));
          pushed += 1;
        } catch (error) {
          failed += 1;
          const statusCode = typeof error === 'object' && error && 'statusCode' in error ? Number(error.statusCode) : 0;
          if (statusCode === 404 || statusCode === 410) await db.from('push_subscriptions').delete().eq('id', subscription.id);
        }
      }
    }
    await db.from('notifications').update({ delivered_at: now.toISOString() }).eq('id', notification.id).is('delivered_at', null);
  }
  return { summariesCreated, delivered: notifications?.length ?? 0, pushed, failed, pushEnabled };
}
