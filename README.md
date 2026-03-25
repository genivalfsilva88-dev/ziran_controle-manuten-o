# ZIRAN Cloudflare + Supabase

Projeto convertido do Flask local para Cloudflare Pages + Functions + Supabase.

## Variáveis no Cloudflare Pages
Cadastre estas variáveis em **Settings > Environment variables**:

- `SUPABASE_URL` = URL do seu projeto Supabase
- `SUPABASE_ANON_KEY` = chave anon do Supabase
- `SUPABASE_SERVICE_ROLE_KEY` = service_role do Supabase
- `ADMIN_PASSWORD_HASH` = hash SHA-256 da senha do gestor

Hash atual da senha original `ziran26`:
`fd5d9fea9607cd29e828e77821a9b18299110c214feef0b1a2e2b19175147f03`

## Ordem de implantação
1. No Supabase, rode `supabase_schema.sql`.
2. Depois rode `supabase_seed.sql` para importar os dados atuais.
3. No Cloudflare Pages, conecte este projeto ao GitHub.
4. Build command: vazio
5. Build output directory: `public`
6. Deploy.

## Observações
- As leituras são públicas.
- Escrita/edição/liberação/exclusão passam pelas Functions e exigem a senha do gestor.
- As Functions usam a `service_role` para gravar no Supabase sem expor a chave no navegador.
