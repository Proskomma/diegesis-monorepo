# Vue demo client for the Diegesis monorepo

## Project Setup

```sh
npm install
```

### Compile and Minify for both production and development (see note below)

```sh
npm run build
```

Compile and hot-reload for development is normally run with `npm run dev` but since the client is served statically in this repo, this command is not recommended though present in the `package.json` file.

## Data Setup
This app expects eBible's `fra_fob` Bible to be present in the local Diegesis server data.
