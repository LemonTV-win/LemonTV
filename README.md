# 🍋LemonTV

[![Project stage: Experimental][project-stage-badge: Experimental]][project-stage-page]

[project-stage-badge: Experimental]: https://img.shields.io/badge/Project%20Stage-Experimental-yellow.svg
[project-stage-page]: https://blog.pother.ca/project-stages/

LemonTV – Comprehensive esports coverage, live scores, rankings, and news for the competitive Strinova scene.

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
