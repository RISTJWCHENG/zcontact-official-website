# zContact Official Website

The public website of zContact, the privacy-first messaging app on the
Internet Computer. It introduces zContact Chat.

Live: <https://z3efs-jaaaa-aaaam-qjtlq-cai.icp0.io/>

## What is in it

A static page served from its own ICP asset canister:

| Path | What |
| --- | --- |
| `src/index.html` | The page |
| `src/style.css` | Styles |
| `src/main.js` | Small interactions (no network requests) |
| `src/logo.png` | Logo |
| `src/fonts/` | Inter, Space Grotesk and IBM Plex Mono (self-hosted, with their licences) |
| `src/.ic-assets.json5` | Security headers: strict CSP, no third-party content, no analytics |

Everything is served from the canister: no third-party scripts, styles,
fonts, images or trackers, and the page makes no network requests.

## Preview locally

Any static file server works, for example:

```bash
npx serve src
```

## Deploy

Requires [dfx](https://internetcomputer.org/docs/building-apps/getting-started/install) 0.32
and the controller identity of the canister.

```bash
dfx deploy --network ic zcontact-website
```

Canister: `z3efs-jaaaa-aaaam-qjtlq-cai` (see `canister_ids.json`).

## Related

The zContact app itself (chat frontend and canisters) lives in its own
repository, `zcontact-chat`.

## License

Proprietary. See [LICENSE](LICENSE). The fonts in `src/fonts/` keep their
own open licences (SIL Open Font License), included next to them.
