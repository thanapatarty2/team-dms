import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.7";

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@team-dms.local";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { target_staff_id, target_roles, title, body, url, tag } = await req.json();

    let userIds: string[] = [];

    if (target_staff_id) {
      const { data } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("staff_id", target_staff_id);
      userIds.push(...(data?.map((u: any) => u.id) || []));
    }

    if (target_roles && Array.isArray(target_roles)) {
      const { data } = await supabase
        .from("user_profiles")
        .select("id")
        .in("app_role", target_roles);
      userIds.push(...(data?.map((u: any) => u.id) || []));
    }

    userIds = [...new Set(userIds)];

    if (userIds.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0, reason: "no target users" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", userIds);

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0, reason: "no subscriptions" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = JSON.stringify({
      title: title || "TEAM-DMS",
      body: body || "",
      url: url || "/",
      tag: tag || "default",
    });

    let sent = 0;
    let cleaned = 0;

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
        sent++;
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          cleaned++;
        } else {
          console.error("push error:", err.statusCode, err.body);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, sent, cleaned }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("send-push error:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});