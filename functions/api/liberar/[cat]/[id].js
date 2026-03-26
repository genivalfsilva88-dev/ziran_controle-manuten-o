import { json, readBody, supabase, hashSHA256 } from "../../../api/shared.js";

function isAdmin(request, env) {
  const hdr = request.headers.get("x-admin-password") || "";
  if (!hdr) return Promise.resolve(false);
  return hashSHA256(hdr).then(h => h === String(env.ADMIN_PASSWORD_HASH || ""));
}

export async function onRequestPost({ request, params, env }) {
  const { cat, id } = params;
  if (!["frota", "implementos", "maquinas"].includes(cat)) return json({ error: "invalid" }, 400);
  if (!(await isAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  try {
    const body = await readBody(request);
    const today = new Date().toISOString().slice(0, 10);
    await supabase(env, `/rest/v1/manutencoes?id=eq.${Number(id)}&categoria=eq.${encodeURIComponent(cat)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        status: 'Liberado',
        categoria_origem: cat,
        data_liberacao: body.data_liberacao || today,
      })
    });
    return json({ ok: true });
  } catch (error) {
    return json({ error: String(error.message || error) }, 500);
  }
}
