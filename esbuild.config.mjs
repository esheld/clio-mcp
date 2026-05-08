import { build } from "esbuild";

await build({
  entryPoints: ["src/cli.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  outfile: "dist/bundle.cjs",
  define: {
    "import.meta.url": "import_meta_url",
    __CLIO_CLIENT_ID__: JSON.stringify(process.env.CLIO_CLIENT_ID ?? ""),
    __CLIO_CLIENT_SECRET__: JSON.stringify(process.env.CLIO_CLIENT_SECRET ?? ""),
  },
  banner: {
    js: 'var import_meta_url = require("url").pathToFileURL(__filename).href;',
  },
});
