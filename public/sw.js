// Daily Board service worker: shows reminders and handles taps. No offline caching.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: "Daily Board", body: e.data ? e.data.text() : "" }; }
  const opts = {
    body: d.body || "",
    tag: d.tag || undefined,
    renotify: !!d.tag,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: d.url || "/#today", taskId: d.taskId || "", sig: d.sig || "" },
    // iPhone ignores these buttons; tapping the notification opens the task instead.
    actions: d.taskId ? [{ action: "done", title: "Done" }, { action: "snooze", title: "Snooze 1 hour" }] : [],
  };
  const jobs = [self.registration.showNotification(d.title || "Daily Board", opts)];
  if (typeof d.badge === "number" && self.navigator && self.navigator.setAppBadge) jobs.push(self.navigator.setAppBadge(d.badge).catch(() => {}));
  e.waitUntil(Promise.all(jobs));
});

self.addEventListener("notificationclick", (e) => {
  const n = e.notification, d = n.data || {};
  n.close();
  if ((e.action === "done" || e.action === "snooze") && d.taskId) {
    e.waitUntil(fetch("/api/push/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId: d.taskId, sig: d.sig, act: e.action }) }).catch(() => {}));
    return;
  }
  const url = new URL(d.url || "/#today", self.location.origin).href;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      if (new URL(c.url).origin === self.location.origin) {
        await c.focus();
        c.postMessage({ type: "open", url });
        return;
      }
    }
    await self.clients.openWindow(url);
  })());
});
