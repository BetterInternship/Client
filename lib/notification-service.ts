/**
 * Provides functions for sending web notifications.
 */

// check if the browser supports the web notifications api.
export function checkNotificationSupport() {
  return 'Notification' in window;
}

// send popup to request notification permission.
export async function requestNotificationPermission() {
  return await Notification.requestPermission();
}

// check for permission state.
export function getNotificationPermission() {
  return Notification.permission;
}

export type ChatNotificationOptions = {
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
};

// check if the page is visible. can be used to determine whether notifications can be shown.
export function shouldShowNotification() {
  return document.hidden;
}

// send a new notification.
export function sendNotification(title: string, options: ChatNotificationOptions) {
  if (!checkNotificationSupport || getNotificationPermission() !== 'granted') {
    return;
  }

  let n: Notification = new Notification(title, options);
  return n;
}