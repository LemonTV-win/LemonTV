# 🍋LemonTV

[![Project stage: Development][project-stage-badge: Development]][project-stage-page]

[project-stage-badge: Development]: https://img.shields.io/badge/Project%20Stage-Development-yellowgreen.svg
[project-stage-page]: https://blog.pother.ca/project-stages/

LemonTV – Comprehensive esports coverage, live scores, rankings, and news for the competitive Strinova scene.

## Support

LemonTV is a fan-run project built with ❤️ by one developer and our community. Hosting and infrastructure currently cost ~\$1,200 USD/year. If you enjoy LemonTV or find it useful, please consider supporting the project on Ko‑fi — any amount helps.

[![Support me on Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/mkpoli)

### Sponsors

Current supporters (1):

- Eaterrius 💛

## Developing

```bash
bun i
bun dev
```

### Prepare the local database

```bash
bun run db:dev:push
```

### Deploys

<!-- Infobox -->

> [!NOTE]
> We have moved from automatic push to Git repository deployment to manual deployment.

```bash
bun run deploy
```

## License

LemonTV is split into two separately-licensed parts so that both the code and the
data can be reused as openly as possible:

- **Source code** — [MIT License](LICENSE).
- **Esports dataset** (players, teams, events, matches, statistics, served via the
  API / bulk dumps / database) — [Creative Commons Attribution 4.0 International
  (CC BY 4.0)](LICENSE-DATA.md). Reuse freely with attribution to LemonTV.

Trademarks, team/event logos, player avatars, and other third-party content are
**not** covered by either license and remain the property of their respective
owners. See [`LICENSE-DATA.md`](LICENSE-DATA.md) for the full scope and an
important data-provenance note.
