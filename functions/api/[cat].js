import { json, readBody, supabase, mapManutencao, normalizeManutencao, hashSHA256 } from "./shared.js";

const allowed = ["frota", "implementos", "maquinas", "historico"];

function isAdmin(request, env) {
  const hdr = request.headers.get("x-admin-password") || "";
  if (!hdr) return Promise.resolve(false);
  return hashSHA256(hdr).then(h => h === String(env.ADMIN_PASSWORD_HASH || ""));
}

export async function onRequestGet({ params, env }) {
  const cat = params.cat;
  if (!allowed.includes(cat)) return json({ error: "invalid" }, 400);
  try {
    if (cat === "historico") {
      const rows = await supabase(env, `/rest/v1/manutencoes?select=*&or=(status.eq.Liberado,data_liberacao.not.is.null)&order=data_liberacao.desc.nullslast,id.desc`);
      return json(Array.isArray(rows) ? rows.map(mapManutencao) : []);
    }

    const rows = await supabase(env, `/rest/v1/manutencoes?select=*&categoria=eq.${encodeURIComponent(cat)}&order=id.asc`);
    const ativos = (Array.isArray(rows) ? rows : []).filter(r => r.status !== 'Liberado' && !r.data_liberacao);
    return json(ativos.map(mapManutencao));
  } catch (error) {
    return json({ error: String(error.message || error) }, 500);
  }
}

export async function onRequestPost(context) {
  const { request, params, env } = context;
  const cat = params.cat;
  if (!["frota", "implementos", "maquinas"].includes(cat)) return json({ error: "invalid" }, 400);
  if (!(await isAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  try {
    const body = await readBody(request);
    const row = normalizeManutencao(body, cat);
    if (row.data_liberacao) {
      row.status = 'Liberado';
      row.categoria_origem = cat;
    } else {
      row.status = row.status || null;
      row.categoria_origem = null;
    }
    const data = await supabase(env, `/rest/v1/manutencoes`, {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(row)
    });
    return json({ ok: true, id: data?.[0]?.id, moved_to_history: !!row.data_liberacao });
  } catch (error) {
    return json({ error: String(error.message || error) }, 500);
  }
}
