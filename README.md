# Artimis AI

AI-assistent for smarthjem med brukerinnlogging og skylagring.

**Stack:** Tavus CVI · Daily.js · n8n webhooks · Homey · Supabase Auth

---

## Funksjoner

- **Google-innlogging** eller epost/passord via Supabase Auth
- **Skylagring av innstillinger** – konfigurasjonen din følger deg på alle enheter
- Full-skjerm video-samtale med Tavus avatar
- Integrert smarthjem-kontroll via Homey og n8n webhooks

---

## Oppsett

### 1. Supabase-prosjekt

1. Gå til [supabase.com](https://supabase.com) og opprett et gratis prosjekt
2. Aktiver **Google OAuth** under Authentication → Providers → Google
3. Kjør dette SQL-et i SQL Editor for å lage innstillingstabellen:

```sql
create table if not exists public.user_settings (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- Row Level Security: kun eieren kan se/endre sine innstillinger
alter table public.user_settings enable row level security;

create policy "Users can read own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can upsert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);
```

4. Hent **Project URL** og **anon public key** fra Project Settings → API

### 2. Start dashbordet

Du trenger ingen backend. Åpne `index.html` direkte via en lokal server:

```bash
cd Artimis-AI
python3 -m http.server 9090
# Åpne http://localhost:9090 i nettleseren
```

Første gang du åpner appen, vil du se et oppsettskjema der du limer inn Supabase URL og anon-nøkkel. Disse lagres i `localStorage` – du trenger bare å gjøre det én gang per nettleser.

### 3. Deploy til Railway (valgfritt)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -m main
gh repo create Oleandret/Artimis-AI --public --source=. --push
```

Railway plukker opp GitHub-repoet automatisk og bygger via `next.config.js` hvis du legger til et Next.js-lag (se `tavus-n8n-mcp` som referanse).

---

## Konfigurasjonsrekkefølge

1. Lim inn Supabase URL + anon-nøkkel (første gangs oppsett i innloggingsvinduet)
2. Logg inn med Google eller epost/passord
3. Gå til ⚙️ Innstillinger og fyll inn Tavus API-nøkkel, Persona ID, n8n webhook-URL osv.
4. Klikk **☁️ Lagre innstillinger** – innstillingene synkroniseres til Supabase og er tilgjengelige neste gang du logger inn
