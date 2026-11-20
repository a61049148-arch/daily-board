// Bridges the board UI (lib/board.js) to Supabase and the app's API routes.
// The board talks to a small Firestore-like surface: collection(c).onSnapshot, doc("c/id").set/delete.

const SPEC = {
  tasks: { pk: "id", fields: { title: "t", area: "t", due: ["due", "d"], done: "b", doneOn: ["done_on", "d"], order: ["sort_order", "n"], person: "t", note: "t", source: "t", created: "ts" } },
  people: { pk: "id", fields: { name: "t", org: "t", area: "t", contact: "t", followUp: ["follow_up", "d"], lastContact: ["last_contact", "d"], note: "t" } },
  notes: { pk: "user_id,id", fields: { text: "t", updated: "ts" } },
  plans: { pk: "user_id,id", fields: { brief: "t", blocks: "j", created: "ts" } },
};

function colOf(key, def) { return Array.isArray(def) ? def : [key, def]; }

function toRow(coll, id, obj, userId) {
  const row = { id, user_id: userId };
  for (const [key, def] of Object.entries(SPEC[coll].fields)) {
    const [col, type] = colOf(key, def);
    const v = obj[key];
    if (type === "d") row[col] = v ? v : null;
    else if (type === "ts") row[col] = v || new Date().toISOString();
    else if (type === "b") row[col] = !!v;
    else if (type === "n") row[col] = Number(v) || Date.now();
    else if (type === "j") row[col] = v || [];
    else row[col] = v == null ? "" : String(v);
  }
  return row;
}

function fromRow(coll, row) {
  const obj = {};
  for (const [key, def] of Object.entries(SPEC[coll].fields)) {
    const [col, type] = colOf(key, def);
    const v = row[col];
    if (type === "d") obj[key] = v || "";
    else if (type === "b") obj[key] = !!v;
    else if (type === "n") obj[key] = Number(v) || 0;
    else if (type === "j") obj[key] = v || [];
    else obj[key] = v == null ? "" : v;
  }
  return obj;
}

export function makeDb(sb, userId) {
  let pending = 0;
  const waiters = [];
  function settle() { if (pending === 0) while (waiters.length) waiters.shift()(); }
  function idle() { return pending === 0 ? Promise.resolve() : new Promise((r) => waiters.push(r)); }

  async function fetchAll(coll) {
    let q = sb.from(coll).select("*");
    if (coll === "tasks") {
      const cutoff = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
      q = q.or(`done.eq.false,done_on.gte.${cutoff}`);
    }
    if (coll === "plans") {
      const cutoff = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10);
      q = q.gte("id", cutoff);
    }
    const { data, error } = await q.limit(5000);
    if (error) throw error;
    return data;
  }

  return {
    collection(coll) {
      return {
        onSnapshot(next, onError) {
          let timer = null, alive = true;
          async function load() {
            await idle();
            try {
              const rows = await fetchAll(coll);
              if (!alive) return;
              next({ docs: rows.map((r) => ({ id: r.id, data: () => fromRow(coll, r) })), metadata: { fromCache: false } });
            } catch (e) { if (alive && onError) onError({ code: "unavailable", message: e.message }); }
          }
          load();
          const channel = sb.channel("db-" + coll)
            .on("postgres_changes", { event: "*", schema: "public", table: coll }, () => {
              clearTimeout(timer); timer = setTimeout(load, 350);
            })
            .subscribe();
          const onFocus = () => { if (document.visibilityState === "visible") load(); };
          document.addEventListener("visibilitychange", onFocus);
          return () => { alive = false; clearTimeout(timer); sb.removeChannel(channel); document.removeEventListener("visibilitychange", onFocus); };
        },
      };
    },
    doc(path) {
      const [coll, id] = path.split("/");
      return {
        async set(obj) {
          pending++;
          try {
            const { error } = await sb.from(coll).upsert(toRow(coll, id, obj, userId), { onConflict: SPEC[coll].pk });
            if (error) throw { code: "unavailable", message: error.message };
          } finally { pending--; settle(); }
        },
        async delete() {
          pending++;
          try {
            const { error } = await sb.from(coll).delete().eq("id", id);
            if (error) throw { code: "unavailable", message: error.message };
          } finally { pending--; settle(); }
        },
      };
    },
  };
}

async function authedFetch(sb, url, init) {
  const { data } = await sb.auth.getSession();
  const token = data.session && data.session.access_token;
  const res = await fetch(url, { ...init, headers: { ...(init && init.headers), Authorization: "Bearer " + token, "Content-Type": "application/json" } });
  let body = null;
  try { body = await res.json(); } catch (_) {}
  if (!res.ok) throw { code: (body && body.error) || "unavailable", message: (body && body.message) || res.statusText, status: res.status };
  return body;
}

export function makeSample(sb) {
  return {
    json(prompt, opts) {
      return authedFetch(sb, "/api/ai", { method: "POST", body: JSON.stringify({ prompt, tier: (opts && opts.modelTier) || "default" }) }).then((b) => b.result);
    },
  };
}

export function makeCalendar(sb) {
  return function fetchEvents() {
    return authedFetch(sb, "/api/calendar", { method: "GET" });
  };
}
