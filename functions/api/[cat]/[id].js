import { json, readBody, supabase, normalizeManutencao, hashSHA256 } from "../shared.js";

function isAdmin(request, env) {
  const hdr = request.headers.get("x-admin-password") || "";
  if (!hdr) return Promise.resolve(false);
  return hashSHA256(hdr).then(h => h === String(env.ADMIN_PASSWORD_HASH || ""));
}

export async function onRequestPut({ request, params, env }) {
  const { cat, id } = params;
  if (!["frota", "implementos", "maquinas"].includes(cat)) return json({ error: "invalid" }, 400);
  if (!(await isAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  try {
    const body = await readBody(request);
    const row = normalizeManutencao(body, cat);
    if (row.data_liberacao) {
      row.status = 'Liberado';
      row.categoria_origem = cat;
    } else {
      row.status = null;
      row.categoria_origem = null;
    }
    await supabase(env, `/rest/v1/manutencoes?id=eq.${Number(id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(row)
    });
    return json({ ok: true, moved_to_history: !!row.data_liberacao });
  } catch (error) {
    return json({ error: String(error.message || error) }, 500);
  }
}

export async function onRequestDelete({ request, params, env }) {
  const { cat, id } = params;
  if (!["frota", "implementos", "maquinas"].includes(cat)) return json({ error: "invalid" }, 400);
  if (!(await isAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  try {
    await supabase(env, `/rest/v1/manutencoes?id=eq.${Number(id)}&categoria=eq.${cat}`, {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' }
    });
    return json({ ok: true });
  } catch (error) {
    return json({ error: String(error.message || error) }, 500);
  }
}
