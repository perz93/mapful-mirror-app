import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * notify-events — Scheduled Edge Function
 *
 * Called by pg_cron every 30 minutes. Handles:
 * 1. NEW_EVENT: Notify all users when a new event is published (last 35 min)
 * 2. EVENT_TOMORROW: Remind interested users (favorites) of events happening tomorrow (at ~18h)
 * 3. EVENT_STARTING: Notify interested users (favorites) ~1h before event starts
 * 4. EVENT_REMINDER: Send user-set reminders (from event_reminders table)
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const SEND_PUSH_URL = `${SUPABASE_URL}/functions/v1/send-push`;

async function callSendPush(params: Record<string, unknown>) {
  const res = await fetch(SEND_PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(params),
  });
  return res.json();
}

// Personnes intéressées par un événement : favoris (cœur) + anciens « J'y vais ».
// deno-lint-ignore no-explicit-any
async function audienceFor(supabase: any, eventId: string): Promise<string[]> {
  const ids = new Set<string>();
  for (const table of ["event_favorites", "event_attendees"]) {
    const { data, error } = await supabase.from(table).select("user_id").eq("event_id", eventId);
    if (error) continue; // table absente : on ignore
    for (const row of data ?? []) if (row.user_id) ids.add(row.user_id);
  }
  return [...ids];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Seuls les appels serveur (cron, trigger, notify-events) avec la clé
  // service_role peuvent déclencher des envois — sinon n'importe qui
  // pourrait spammer tous les abonnés.
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!SUPABASE_SERVICE_ROLE_KEY || token !== SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date();
    const results: Record<string, unknown> = {};

    // --- 1. NEW EVENTS (published in last 35 minutes) ---
    const thirtyFiveMinAgo = new Date(now.getTime() - 35 * 60 * 1000).toISOString();
    const { data: newEvents } = await supabase
      .from("events")
      .select("id, title, category, venue, date, time, image_url")
      .eq("is_published", true)
      .gte("created_at", thirtyFiveMinAgo);

    if (newEvents && newEvents.length > 0) {
      const newEventResults = [];
      for (const event of newEvents) {
        const result = await callSendPush({
          title: `🎉 ${event.title}`,
          body: `${event.venue} — ${event.category}`,
          url: `/event/${event.id}`,
          image: event.image_url,
          tag: `new-${event.id}`,
          send_to_all: true,
          check_duplicates: true,
          notification_type: "new_event",
          event_id: event.id,
        });
        newEventResults.push(result);
      }
      results.new_events = { count: newEvents.length, results: newEventResults };
    }

    // --- 2. EVENTS TOMORROW (notify attendees at ~18h the day before) ---
    const currentHour = now.getUTCHours(); // Abidjan is UTC+0
    if (currentHour >= 17 && currentHour <= 18) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      const { data: tomorrowEvents } = await supabase
        .from("events")
        .select("id, title, venue, time")
        .eq("is_published", true)
        .eq("date", tomorrowStr);

      if (tomorrowEvents && tomorrowEvents.length > 0) {
        const tomorrowResults = [];
        for (const event of tomorrowEvents) {
          const userIds = await audienceFor(supabase, event.id);

          if (userIds.length > 0) {
            const result = await callSendPush({
              title: `📅 ${event.title}`,
              body: `${event.venue} — ${event.time.substring(0, 5)}`,
              url: `/event/${event.id}`,
              tag: `tomorrow-${event.id}`,
              user_ids: userIds,
              check_duplicates: true,
              notification_type: "event_tomorrow",
              event_id: event.id,
            });
            tomorrowResults.push(result);
          }
        }
        results.tomorrow_events = { count: tomorrowEvents.length, results: tomorrowResults };
      }
    }

    // --- 3. EVENTS STARTING SOON (within next 30-65 minutes) ---
    const todayStr = now.toISOString().split("T")[0];
    const { data: todayEvents } = await supabase
      .from("events")
      .select("id, title, venue, time")
      .eq("is_published", true)
      .eq("date", todayStr);

    if (todayEvents && todayEvents.length > 0) {
      const startingSoonResults = [];
      for (const event of todayEvents) {
        const [hours, minutes] = event.time.split(":").map(Number);
        const eventTime = new Date(now);
        eventTime.setHours(hours, minutes, 0, 0);

        const diffMinutes = (eventTime.getTime() - now.getTime()) / (60 * 1000);

        if (diffMinutes >= 30 && diffMinutes <= 65) {
          const userIds = await audienceFor(supabase, event.id);

          if (userIds.length > 0) {
            const result = await callSendPush({
              title: `⏰ ${event.title}`,
              body: `${event.venue} — dans ~1h`,
              url: `/event/${event.id}`,
              tag: `starting-${event.id}`,
              user_ids: userIds,
              check_duplicates: true,
              notification_type: "event_starting",
              event_id: event.id,
            });
            startingSoonResults.push(result);
          }
        }
      }
      if (startingSoonResults.length > 0) {
        results.starting_soon = { count: startingSoonResults.length, results: startingSoonResults };
      }
    }

    // --- 4. USER-SET REMINDERS (from event_reminders table) ---
    const thirtyFiveMinFromNow = new Date(now.getTime() + 35 * 60 * 1000).toISOString();
    const { data: dueReminders } = await supabase
      .from("event_reminders")
      .select("id, user_id, event_id, events(title, venue, time, image_url)")
      .eq("sent", false)
      .lte("remind_at", thirtyFiveMinFromNow)
      .gte("remind_at", now.toISOString().replace('T', ' ').substring(0, 19));

    // Also get reminders that are past due but not sent (catch missed ones)
    const { data: pastDueReminders } = await supabase
      .from("event_reminders")
      .select("id, user_id, event_id, events(title, venue, time, image_url)")
      .eq("sent", false)
      .lt("remind_at", now.toISOString())
      // pas de rappel pour un événement déjà passé depuis longtemps
      .gte("remind_at", new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString());

    const allDueReminders = [...(dueReminders || []), ...(pastDueReminders || [])];
    // Dedupe by id
    const uniqueReminders = Array.from(new Map(allDueReminders.map(r => [r.id, r])).values());

    if (uniqueReminders.length > 0) {
      const reminderResults = [];
      for (const reminder of uniqueReminders) {
        const event = (reminder as any).events;
        if (!event) continue;

        const result = await callSendPush({
          title: `🔔 ${event.title}`,
          body: `${event.venue} — ${event.time?.substring(0, 5)}`,
          url: `/event/${reminder.event_id}`,
          tag: `reminder-${reminder.event_id}`,
          user_ids: [reminder.user_id],
          check_duplicates: true,
          notification_type: "event_reminder",
          event_id: reminder.event_id,
        });
        reminderResults.push(result);

        // Mark as sent
        await supabase
          .from("event_reminders")
          .update({ sent: true })
          .eq("id", reminder.id);
      }
      results.reminders = { count: uniqueReminders.length, results: reminderResults };
    }

    return new Response(JSON.stringify({ success: true, results, timestamp: now.toISOString() }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
