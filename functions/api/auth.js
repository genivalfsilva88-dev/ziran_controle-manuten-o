import { json, readBody, hashSHA256 } from "./shared.js";

export async function onRequestPost({ request, env }) {
  const body = await readBody(request);
  const pwd = String(body.password || "");
  const hash = await hashSHA256(pwd);
  if (hash === String(env.ADMIN_PASSWORD_HASH || "")) return json({ ok: true });
  return json({ ok: false, error: "Senha incorreta" }, 401);
}
