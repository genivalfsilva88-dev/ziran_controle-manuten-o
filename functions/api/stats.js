import { json, supabase } from "./shared.js";

export async function onRequestGet({ env }) {
  try {
    const rows = await supabase(env, `/rest/v1/manutencoes?select=id,categoria,status,sla,data_liberacao`);
    const veiculos = await supabase(env, `/rest/v1/veiculos?select=placa&order=placa.asc`);
    const manut = Array.isArray(rows) ? rows : [];
    const ativos = manut.filter(r => r.status !== 'Liberado' && !r.data_liberacao);
    const historico = manut.filter(r => r.status === 'Liberado' || r.data_liberacao);
    return json({
      total: ativos.length,
      em_atraso: ativos.filter(m => m.sla === 'Em atraso').length,
      no_prazo: ativos.filter(m => m.sla === 'No prazo').length,
      frota: ativos.filter(m => m.categoria === 'frota').length,
      implementos: ativos.filter(m => m.categoria === 'implementos').length,
      maquinas: ativos.filter(m => m.categoria === 'maquinas').length,
      veiculos: Array.isArray(veiculos) ? veiculos.length : 0,
      historico: historico.length,
    });
  } catch (error) {
    return json({ error: String(error.message || error) }, 500);
  }
}
