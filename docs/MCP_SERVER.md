# LemonTV MCP Server

The authorized MCP server lets editors manage LemonTV data from an AI client
(Claude Desktop, Claude Code, etc.). Every action is performed **as the token
owner** and recorded in `edit_history`, so AI-assisted edits are attributable
and auditable just like edits made through the admin UI.

## Endpoint & authentication

- **Endpoint:** `POST https://lemontv.win/api/mcp` (JSON-RPC 2.0, MCP protocol `2024-11-05`)
- **Auth:** a Personal Access Token (PAT) in the `Authorization: Bearer …` header.

Mint a token at **Profile → MCP Tokens** (`/profile/mcp-tokens`):

- **Read** tokens can call read tools (`list_events`, `get_event`).
- **Write** tokens can additionally call write tools (`create_event`). A write
  token only works while its owner still holds the `editor` or `admin` role — if
  the role is removed, the token silently drops to read-only.

The plaintext token (`lemon_pat_…`) is shown **once** at creation. Store it like
a password; it can be revoked any time from the same page.

## Connecting from Claude Code

```bash
claude mcp add --transport http lemontv https://lemontv.win/api/mcp \
  --header "Authorization: Bearer lemon_pat_YOUR_TOKEN_HERE"
```

Claude Desktop and other clients: point a Streamable-HTTP MCP server at the
endpoint above and set the same `Authorization` header.

## Tools

| Tool                     | Scope     | Purpose                                                                                 |
| ------------------------ | --------- | --------------------------------------------------------------------------------------- |
| `list_events`            | read      | List tournaments/events (newest first); optional `status` filter.                       |
| `get_event`              | read      | Fetch one event by `idOrSlug`, including organizers/links/videos/teams/results/casters. |
| `draft_event_from_url`   | read      | Fetch a public source URL and return a best-effort event draft plus evidence.           |
| `create_event`           | **write** | Create a new tournament/event. Returns the new id plus the full created event.          |
| `update_event`           | **write** | Partially update scalar event fields and return the full updated event.                 |
| `set_event_websites`     | **write** | Replace all related links/websites for an event.                                        |
| `add_event_teams`        | **write** | Add/update event participant teams without dropping existing participants.              |
| `set_event_results`      | **write** | Replace final placements/results for an event.                                          |
| `add_event_team_players` | **write** | Add event roster players for participant teams.                                         |
| `set_event_casters`      | **write** | Replace event casters/talent.                                                           |
| `list_players`           | read      | List players; optional name/slug `search` + `limit`.                                    |
| `get_player`             | read      | Fetch one player by id/slug/name (account PII omitted).                                 |
| `create_player`          | **write** | Create a player. Returns the new id.                                                    |
| `list_teams`             | read      | List teams; optional `region` filter + `limit`.                                         |
| `get_team`               | read      | Fetch one team by id/slug incl. roster (account PII omitted).                           |
| `create_team`            | **write** | Create a team. Returns the new id.                                                      |

Read tools strip account PII (`user.email`/`username`/linkage) from output.

`create_event` arguments: `name`, `server` (`calabiyau`\|`strinova`),
`format` (`lan`\|`online`\|`hybrid`), `region`, `status`
(`upcoming`\|`live`\|`finished`\|`cancelled`\|`postponed`), and `date`
(`YYYY-MM-DD` or `YYYY-MM-DD/YYYY-MM-DD`). Optional fields: `slug` (generated
from `name` when omitted, with a numeric suffix if needed), `image` (if omitted
the site shows a branded placeholder; an `https` URL is fetched into LemonTV
storage), `official`, `capacity`, `organizerIds`, and `websites`.
`official`/`capacity` also accept common loosely-typed MCP forms such as
`"true"`/`"false"` and numeric strings. `websites` is normally an array of
`{ url, label? }`, but the server also tolerates a single URL, newline/comma
separated URLs, or a JSON-stringified array for less capable clients. Teams, results, and casters are added separately. `create_event` and `update_event`
return the full event object after writing so clients can verify stored image keys,
websites, participants, results, and casters immediately.

`set_event_websites` arguments: `idOrSlug` and `websites`. It uses replace-all
semantics: pass the complete desired list, or an empty array to clear links. Like
`create_event`, it accepts arrays of `{ url, label? }`, URL strings, a single URL,
newline/comma-separated URLs, or a JSON-stringified array. The response includes
the full updated event.

`draft_event_from_url` arguments: `url`. It is read-only: it fetches the public
source page, extracts title/image/date candidates, infers basic fields where
possible, and returns a draft plus evidence/warnings. Always review the draft
before calling `create_event`/`update_event`.

`create_player` arguments: `name` (required), optional `slug`, `nationalities`
(ISO codes; first is primary), `aliases`, `avatar`, `gameAccounts`
(`{ accountId, currentName, region? }`), `socialAccounts`
(`{ platformId, accountId, overridingUrl? }`).

`create_team` arguments: `name` (required), optional `slug`, `abbr`, `region`
(`CN`/`APAC`/`NA`/`SA`/`EU`/`WA`/`Global`), `logo`, `aliases`, `players`
(`{ playerId, role, startedOn?, endedOn?, note? }`; `role` ∈
`active`/`substitute`/`former`/`coach`/`manager`/`owner`), `slogans`.

> **Editing/deleting** existing players & teams over MCP is intentionally not
> exposed yet: the underlying update is a full-replacement of nested collections
> (a safe merge-based `update_*` is a follow-up) and delete is a hard delete.

## Example: adding a tournament

A `tools/call` request to create an event (the slug is optional and will be generated from the name if omitted):

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "tools/call",
	"params": {
		"name": "create_event",
		"arguments": {
			"name": "Origami Cup 4",
			"server": "strinova",
			"format": "online",
			"region": "Global",
			"status": "finished",
			"date": "2026-03-07/2026-03-15",
			"image": "https://picsum.photos/seed/origami-cup-4/300/200",
			"official": false,
			"capacity": 8,
			"websites": [{ "url": "https://www.twitch.tv/origamicup", "label": "Twitch" }]
		}
	}
}
```

## Prepared backfill (March–May 2026 gap)

LemonTV's event list currently stops around February 2026. These two community
tournaments are missing and ready to add via `create_event`. **Fields marked
`TODO` are unverified** — confirm against the organizer's bracket/Discord before
or shortly after creating, since the public sources didn't expose exact
dates/teams/results.

### Origami Cup 4

```json
{
	"name": "Origami Cup 4",
	"slug": "origami-cup-4",
	"server": "strinova",
	"format": "online",
	"region": "Global", // TODO: confirm (OrigamiCup is an EN/global community)
	"status": "finished", // TODO: confirm
	"date": "2026-03-07/2026-03-15", // TODO: confirm exact dates (announced 2026-02-28, rosters 2026-03-04)
	"image": "https://picsum.photos/seed/origami-cup-4/300/200", // TODO: real banner
	"official": false,
	"capacity": 8, // TODO: confirm
	"websites": [{ "url": "https://www.twitch.tv/origamicup", "label": "Twitch" }]
}
```

### EmikoAi Nya Nya Cup

```json
{
	"name": "EmikoAi Nya Nya Cup",
	"slug": "emikoai-nya-nya-cup",
	"server": "strinova",
	"format": "online",
	"region": "Global", // TODO: confirm
	"status": "finished", // TODO: confirm
	"date": "2026-02-01", // TODO: confirm exact date(s) — unverified
	"image": "https://picsum.photos/seed/emikoai-nya-nya-cup/300/200", // TODO: real banner
	"official": false,
	"capacity": 8, // TODO: confirm
	"websites": [{ "url": "https://www.twitch.tv/emikoai_", "label": "Twitch" }]
}
```

Sources: [Origami Cup 4 announcement](https://www.youtube.com/watch?v=TO8w1bOxZUQ),
[OrigamiCup Twitch](https://www.twitch.tv/origamicup),
[EmikoAi Twitch](https://www.twitch.tv/emikoai_).

## Rate limits & audit

- **Rate limit:** each token gets a persisted token bucket (`mcp_rate_limit`) —
  a burst of 120 requests, refilling 2/second. Exceeding it returns an
  `isError` result with a retry-after hint; it does not drop the connection.
- **Audit log:** every tool call's outcome (`success` / `denied` / `error` /
  `rate_limited`) is recorded in `mcp_audit_log` with the token, user, tool, and
  IP — so AI-driven access is moderatable and traceable to a revocable token.
  (Successful data mutations are additionally in `edit_history`.)

## Implementation notes

- Transport + auth: `src/routes/api/mcp/+server.ts`
- Protocol dispatch (pure, unit-tested): `src/lib/server/mcp/dispatch.ts`
- Tool registry: `src/lib/server/mcp/tools.ts`
- Rate-limit core (pure, tested) + DB hooks: `src/lib/server/mcp/rate-limit.ts`, `hooks.ts`
- Shared write path: `createEvent()` in `src/lib/server/data/events.ts` (also
  used by the admin UI), which emits `edit_history` tagged `mcp:create_event`.
