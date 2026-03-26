import { json, readBody, supabase, hashSHA256 } from "./shared.js";

function isAdmin(request, env) {
  const hdr = request.headers.get("x-admin-password") || "";
  if (!hdr) return Promise.resolve(false);
  return hashSHA256(hdr).then(h => h === String(env.ADMIN_PASSWORD_HASH || ""));
}

export async function onRequestGet({ env }) {
  try {
    const rows = await supabase(env, `/rest/v1/veiculos?select=placa,frota,marca,modelo,tipo,ano,documentacao&order=placa.asc`);
    return json(rows);
  } catch (error) {
    return json({ error: String(error.message || error) }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  try {
    const body = await readBody(request);
    const row = {
      placa: body.placa,
      frota: body.frota || null,
      marca: body.marca || null,
      modelo: body.modelo || null,
      tipo: body.tipo || null,
      ano: body.ano === '' || body.ano == null ? null : Number(body.ano),
      documentacao: body.documentacao || null
    };
    await supabase(env, `/rest/v1/veiculos`, {
      method: 'POST',
      headers: { Prefer: 'return=representation,resolution=merge-duplicates' },
      body: JSON.stringify(row)
    });
    return json({ ok: true });
  } catch (error) {
    return json({ error: String(error.message || error) }, 500);
  }
}
