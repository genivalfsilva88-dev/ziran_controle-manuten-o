
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function hashSHA256(text) {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(buf =>
    [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("")
  );
}

export async function requireAuth(request, env) {
  const body = await readBody(request.clone());
  const password = String(body.password || body._password || "");
  const hash = await hashSHA256(password);
  return hash === String(env.ADMIN_PASSWORD_HASH || "");
}

export async function supabase(env, path, options = {}) {
  const base = String(env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  if (!base || !key) {
    throw new Error("Supabase env vars ausentes");
  }
  const headers = new Headers(options.headers || {});
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${key}`);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const resp = await fetch(`${base}${path}`, { ...options, headers });
  const text = await resp.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!resp.ok) {
    throw new Error(typeof data === "object" ? JSON.stringify(data) : String(data || resp.statusText));
  }
  return data;
}

export function mapManutencao(row) {
  return {
    id: row.id,
    frota: row.frota || "",
    placa: row.placa || "",
    tipo: row.tipo || "",
    identificacao: row.identificacao || "",
    placa_frota: row.placa_frota || "",
    data_abertura: row.data_abertura,
    nivel_critico: row.nivel_critico || "",
    motivo: row.motivo || "",
    tipo_manutencao: row.tipo_manutencao || "",
    estabelecimento: row.estabelecimento || "",
    prev_liberacao: row.prev_liberacao,
    prev_liberacao2: row.prev_liberacao2,
    prev_liberacao3: row.prev_liberacao3,
    dias_parado: row.dias_parado,
    dias_entrega: row.dias_entrega,
    localizacao: row.localizacao || "",
    obs1: row.obs1 || "",
    obs2: row.obs2 || "",
    data_liberacao: row.data_liberacao,
    status: row.status || "",
    sla: row.sla || "",
    categoria: row.categoria,
    categoria_origem: row.categoria_origem || null
  };
}

export function normalizeManutencao(payload, categoria) {
  return {
    categoria,
    frota: payload.frota || "",
    placa: payload.placa || "",
    tipo: payload.tipo || "",
    identificacao: payload.identificacao || "",
    placa_frota: payload.placa_frota || "",
    data_abertura: payload.data_abertura || null,
    nivel_critico: payload.nivel_critico || null,
    motivo: payload.motivo || null,
    tipo_manutencao: payload.tipo_manutencao || null,
    estabelecimento: payload.estabelecimento || null,
    prev_liberacao: payload.prev_liberacao || null,
    prev_liberacao2: payload.prev_liberacao2 || null,
    prev_liberacao3: payload.prev_liberacao3 || null,
    dias_parado: payload.dias_parado === '' || payload.dias_parado == null ? null : Number(payload.dias_parado),
    dias_entrega: payload.dias_entrega === '' || payload.dias_entrega == null ? null : Number(payload.dias_entrega),
    localizacao: payload.localizacao || null,
    obs1: payload.obs1 || null,
    obs2: payload.obs2 || null,
    data_liberacao: payload.data_liberacao || null,
    status: payload.status || null,
    sla: payload.sla || null,
    categoria_origem: payload.categoria_origem || null
  };
}
