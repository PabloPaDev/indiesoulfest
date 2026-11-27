# Indie Soul Fest × PlayNotes

Integración OAuth/PKCE + API de lista personal «Indie Soul Fest 2026».  
Destinada a un **BFF en Vercel** (`indiesoulfest.com`): el navegador no debe recibir secretos ni hablar CORS con PlayNotes.

## Variables de entorno (PlayNotes)

| Variable | Uso |
|----------|-----|
| `COMPANION_TOKEN_SIGNING_SECRET` | Secreto HS256 compartido (fallback ISF) |
| `INDIE_SOUL_FEST_TOKEN_SIGNING_SECRET` | Opcional; secreto dedicado ≥32 chars |
| `INDIE_SOUL_FEST_CODE_TTL_SECONDS` | TTL código (default 600) |
| `INDIE_SOUL_FEST_ACCESS_TTL_SECONDS` | TTL access (default 3600) |
| `INDIE_SOUL_FEST_REFRESH_TTL_SECONDS` | TTL refresh (default 30d) |
| `INDIE_SOUL_FEST_DEV_REDIRECT_URI` | Callback local extra (exact match) |

Redirects allowlisted:

- `https://indiesoulfest.com/oauth/callback`
- `http://127.0.0.1:4310/oauth/callback`
- (+ valor exacto de `INDIE_SOUL_FEST_DEV_REDIRECT_URI` si se define)

## Migración

`supabase/migrations/20261127120000_indie_soul_fest_integration.sql`

- `lists.integration_key` + unique parcial `(user_id, integration_key)`
- Dedup + unique `(list_id, game_id)` en `list_games`
- `scopes text[]` en `companion_devices` / `companion_auth_codes`

**No aplicar en producción sin autorización explícita.**

## Autenticación (BFF)

1. Generar `code_verifier` + `code_challenge` (S256) y `state`.
2. Redirigir al usuario a:

```
GET https://www.playnotes.es/oauth/indie-soul-fest
  ?client_id=indie-soul-fest
  &redirect_uri=https://indiesoulfest.com/oauth/callback
  &state=...
  &code_challenge=...
  &code_challenge_method=S256
  &app_name=Indie%20Soul%20Fest
```

3. Tras consentimiento, PlayNotes redirige a `redirect_uri?code=...&state=...`.
4. El **servidor** del fest intercambia el código (nunca desde el browser):

```http
POST /api/integrations/indie-soul-fest/oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "client_id": "indie-soul-fest",
  "code": "...",
  "code_verifier": "...",
  "redirect_uri": "https://indiesoulfest.com/oauth/callback"
}
```

Respuesta:

```json
{
  "token_type": "Bearer",
  "access_token": "...",
  "expires_in": 3600,
  "refresh_token": "...",
  "refresh_expires_in": 2592000,
  "scope": "isf2026.list:read isf2026.list:write",
  "device_id": "...",
  "user": { "id": "...", "username": "...", "avatar_url": "..." }
}
```

5. Guardar tokens en cookies httpOnly del dominio del fest.
6. Refresh:

```json
{
  "grant_type": "refresh_token",
  "client_id": "indie-soul-fest",
  "refresh_token": "..."
}
```

7. Revoke: `POST /api/integrations/indie-soul-fest/oauth/revoke` con Bearer o `{ "refresh_token": "..." }`.

Scopes: `isf2026.list:read`, `isf2026.list:write`.  
Los tokens `typ=isf_access` **no** sirven en `/api/companion/*`.

## Catálogo y correspondencias

Fuente editorial: `data/indie-soul-fest/festival-catalog-source.json`  
Mapping PlayNotes: `data/indie-soul-fest/playnotes-mapping.json` (también en `src/lib/integrations/indieSoulFest/playnotes-mapping.json` para allowlist).

```bash
# Solo lectura IGDB + SELECT Supabase (no escribe BD)
npx tsx --env-file=.env.local scripts/resolve-indie-soul-fest-catalog.ts

# Seed (bloqueado por defecto). Requiere confirmación explícita.
# NO usar en producción sin autorización.
ISF_SEED_APPLY=1 ISF_SEED_CONFIRM=indie-soul-fest-2026 \
  npx tsx --env-file=.env.local scripts/seed-indie-soul-fest-games.ts
```

Identificador canónico de sync: **`game_id` (UUID PlayNotes)**.  
`igdb_id` sigue soportado como compatibilidad.

Migración adicional: `20261127140000_games_steam_app_id_and_isf_catalog.sql` (`games.steam_app_id` + unique parcial).

## API de lista

Base: `/api/integrations/indie-soul-fest`  
Header: `Authorization: Bearer <access_token>`  
Sin CORS permisivo (BFF server-to-server).  
Solo juegos del catálogo oficial ISF 2026 (allowlist UUID / igdb / steam del mapping).

### GET `/me`

```json
{
  "user": { "id": "...", "username": "...", "avatar_url": "..." },
  "deviceId": "...",
  "scopes": ["isf2026.list:read", "isf2026.list:write"]
}
```

### GET `/list`

Si aún no hay lista (no se ha guardado ningún juego):

```json
{
  "list": null,
  "integrationKey": "indie_soul_fest_2026",
  "games": []
}
```

Con lista:

```json
{
  "list": {
    "id": "uuid",
    "title": "Indie Soul Fest 2026",
    "description": "...",
    "integrationKey": "indie_soul_fest_2026",
    "createdAt": "..."
  },
  "games": [
    {
      "gameId": "uuid",
      "igdbId": 12345,
      "title": "...",
      "coverUrl": "...",
      "position": 1
    }
  ]
}
```

### POST `/list/import`

Importa localStorage (idempotente). Preferir `game_ids`. Máx. 100 ids.  
Compat: `igdb_ids`.

```json
{ "game_ids": ["uuid-1", "uuid-2"] }
```

```json
{ "igdb_ids": [111, 222], "game_ids": ["uuid-1"] }
```

```json
{
  "list": { "id": "...", "title": "...", "integrationKey": "indie_soul_fest_2026", "createdAt": "..." },
  "games": [ ... ],
  "added": 2,
  "skipped": 1,
  "unresolved_igdb_ids": [999],
  "rejected_game_ids": [],
  "invalid_game_ids": [],
  "invalid_igdb_ids": []
}
```

### POST `/list/games`

```json
{ "game_id": "uuid-playnotes" }
```

Compat: `{ "igdb_id": 12345 }`

### DELETE `/list/games`

```json
{ "game_id": "uuid-playnotes" }
```

Compat: `{ "igdb_id": 12345 }`

## Comportamiento

- Lista anclada por `integration_key = indie_soul_fest_2026` (renombrar `title` no pierde el vínculo).
- Se crea solo al primer add/import.
- Si el usuario borra la lista, no se recrea hasta un nuevo add/import.
- No escribe `user_games` / wishlist.
- No genera XP, logros ni activity feed.
- Excluida de Discover comunitario (soft-private; el modelo de listas no tiene privacidad RLS completa).

## Pruebas

```bash
npx tsx --test src/lib/integrations/indieSoulFest/*.test.ts
npx tsx --test src/lib/companion/concurrency.test.ts
```
