import { json, supabase } from "./shared.js";

export async function onRequestGet({ env }) {
  try {
    const rows = await supabase(env, `/rest/v1/manutencoes?select=updated_at&order=updated_at.desc&limit=1`);
    const v = rows?.[0]?.updated_at ? Date.parse(rows[0].updated_at) : Date.now();
    return json({ ts: v });
  } catch {
    return json({ ts: Date.now() });
  }
}
