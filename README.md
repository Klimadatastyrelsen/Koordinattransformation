# Koordinattransformation

Vue 3 web app that transforms coordinates between the reference systems used in Denmark and Greenland. The transformations run in [WEBPROJ](https://github.com/Klimadatastyrelsen/WEBPROJ) and the address search in Bifrost. Users sign in with KDS Auth, and the app sends their access token as `Authorization: Bearer` to both. It uses the composition API with `<script setup>`, Pinia for state, Vue Router, OpenLayers for the map and Vite to build.

The user guide, in Danish, is in [`docs/site/`](docs/site/).

## Setup

You need Node.js >= 22.14.0 and npm >= 10.9.2.

Copy [.env.example](.env.example) to `.env` and fill in the Bifrost URL, Bifrost key, and map tokens.

Local development runs against a mock login server and WEBPROJ from `compose.yml`:

```bash
docker compose up -d
npm install
npm run dev
```

Sign in with the button on the login page.

## Run

```bash
npm run dev       # dev server, Vite prints the port
npm run build     # production build into dist/
npm run preview   # test-mode build, served on port 4173
```

## Test and lint

```bash
npm run test         # test-mode build, then the Playwright e2e tests
npm run test:debug   # Playwright headed, with the inspector
npm run lint
```

The tests sign in on the login server from `compose.yml`, so start it first. `tests/e2e/auth.test.js` mocks the login, WEBPROJ and Bifrost, and runs without it: `npx playwright test tests/e2e/auth.test.js --no-deps`.

The e2e tests run in Chrome, Edge and Firefox. Safari is left out because it is unstable on Linux.

## Runtime config

The image holds no config, so one image serves every environment. `index.html` has a `window.__CONFIG__` block with `${VITE_*}` placeholders, and the code reads it through `src/runtimeConfig.js`. In the container, `docker/40-envsubst-config.sh` fills the placeholders from the environment at start and refuses to start if one is missing or empty. In `npm run dev` and test builds, a plugin in `vite.config.js` fills them from `.env`.

A new runtime variable needs a placeholder in `index.html` and a key in `src/runtimeConfig.js`.

> [!WARNING]
> The values end up in the served `index.html`, so each visitor can read the map tokens.

## Container and release

To build the rootless nginx image locally:

```bash
docker build -t koordinattransformation:dev .
```

To release, bump the version and push the tag:

```bash
npm version patch    # or minor / major
git push --follow-tags
```

When you push a version tag, GitHub Actions checks it against `package.json` and publishes the image and Helm chart to GHCR. Flux deploys the chart version pinned in the platform repository. The separate Jenkins production pipeline deploys the selected Git tag.

## Code notes

- State lives only in the Pinia store, `src/store/store.js`. A component changes a local ref and sends it to the store with a setter. A component that must react to state reads a store getter through `computed` and watches it.
- Styling comes from the [KDS design system](https://github.com/sdfidk/designsystem). Its variables do not reach a scoped style, and inline CSS cannot style pseudo-elements or conditional classes, so components use a plain `<style>`, never `<style scoped>`.
- Icons come from [design-system-icons](https://sdfidk.github.io/design-system-icons/) and are in `src/assets/icons/icons.svg`. Components refer to an icon by id, for example `icons.svg#arrow-up`. Update the file by hand from the design system repo.
- The Denmark map uses Skærmkortet (dæmpet) from the Datafordeler WMTS. The Greenland map uses Åbent Land Grønland from the Dataforsyningen WMS.
