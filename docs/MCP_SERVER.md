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

| Tool            | Scope     | Purpose                                                           |
| --------------- | --------- | ----------------------------------------------------------------- |
| `list_events`   | read      | List tournaments/events (newest first); optional `status` filter. |
| `get_event`     | read      | Fetch one event by `idOrSlug`.                                    |
| `create_event`  | **write** | Create a new tournament/event. Returns the new id.                |
| `list_players`  | read      | List players; optional name/slug `search` + `limit`.              |
| `get_player`    | read      | Fetch one player by id/slug/name (account PII omitted).           |
| `create_player` | **write** | Create a player. Returns the new id.                              |
| `list_teams`    | read      | List teams; optional `region` filter + `limit`.                   |
| `get_team`      | read      | Fetch one team by id/slug incl. roster (account PII omitted).     |
| `create_team`   | **write** | Create a team. Returns the new id.                                |

Read tools strip account PII (`user.email`/`username`/linkage) from output.

`create_event` arguments: `name`, `slug`, `server` (`calabiyau`\|`strinova`),
`format` (`lan`\|`online`\|`hybrid`), `region`, `status`
(`upcoming`\|`live`\|`finished`\|`cancelled`\|`postponed`), `date`
(`YYYY-MM-DD` or `YYYY-MM-DD/YYYY-MM-DD`), `image` (required — a placeholder URL
is fine), plus optional `official`, `capacity`, `organizerIds`, `websites`.
Teams, results, and casters are added separately (admin UI for now).

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

A `tools/call` request to create an event:

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "tools/call",
	"params": {
		"name": "create_event",
		"arguments": {
			"name": "Origami Cup 4",
			"slug": "origami-cup-4",
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

## Implementation notes

- Transport + auth: `src/routes/api/mcp/+server.ts`
- Protocol dispatch (pure, unit-tested): `src/lib/server/mcp/dispatch.ts`
- Tool registry: `src/lib/server/mcp/tools.ts`
- Shared write path: `createEvent()` in `src/lib/server/data/events.ts` (also
  used by the admin UI), which emits `edit_history` tagged `mcp:create_event`.
