import { json, readBody, supabase, hashSHA256 } from "../shared.js";

function isAdmin(request, env) {
  const hdr = request.headers.get("x-admin-password") || "";
  if (!hdr) return Promise.resolve(false);
  return hashSHA256(hdr).then(h => h === String(env.ADMIN_PASSWORD_HASH || ""));
}

export async function onRequestPut({ request, params, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  try {
    const body = await readBody(request);
    await supabase(env, `/rest/v1/veiculos?placa=eq.${encodeURIComponent(params.placa)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        placa: body.placa,
        frota: body.frota || null,
        marca: body.marca || null,
        modelo: body.modelo || null,
        tipo: body.tipo || null,
        ano: body.ano === '' || body.ano == null ? null : Number(body.ano),
        documentacao: body.documentacao || null
      })
    });
    return json({ ok: true });
  } catch (error) {
    return json({ error: String(error.message || error) }, 500);
  }
}

export async function onRequestDelete({ request, params, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  try {
    await supabase(env, `/rest/v1/veiculos?placa=eq.${encodeURIComponent(params.placa)}`, {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' }
    });
    return json({ ok: true });
  } catch (error) {
    return json({ error: String(error.message || error) }, 500);
  }
}
