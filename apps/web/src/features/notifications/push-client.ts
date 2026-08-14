import { api } from '../../lib/api';

function base64ToArrayBuffer(value: string) {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const raw = atob((value + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0))).buffer;
}

export function pushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function pushConfigured() {
  return Boolean(import.meta.env.VITE_VAPID_PUBLIC_KEY);
}

export async function enableWebPush() {
  if (!pushSupported()) throw new Error('Este navegador no soporta Web Push.');
  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!publicKey) throw new Error('Web Push todavía no tiene una clave VAPID configurada.');
  const permission = await window.Notification.requestPermission();
  if (permission !== 'granted') throw new Error('No se concedió el permiso de notificaciones.');
  const registration = await navigator.serviceWorker.register('/sw.js');
  const existing = await registration.pushManager.getSubscription();
  const subscription = existing ?? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ToArrayBuffer(publicKey) });
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) throw new Error('El navegador no devolvió una suscripción válida.');
  await api('/notifications/push-subscriptions', { method: 'POST', body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, user_agent: navigator.userAgent }) });
}

export async function disableWebPush() {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  await api('/notifications/push-subscriptions', { method: 'DELETE', body: JSON.stringify({ endpoint: subscription.endpoint }) });
  await subscription.unsubscribe();
}
