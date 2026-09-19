import { build } from "esbuild"
import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const root = resolve(new URL("..", import.meta.url).pathname)
const result = await build({
  entryPoints: [resolve(root, "features/serializers/html/browser-runtime.js")],
  bundle: true,
  format: "esm",
  external: ["https://esm.sh/*"],
  minify: true,
  write: false,
  legalComments: "none",
})

const outputPath = resolve(root, "features/serializers/html/generated/browser-runtime.js")
await mkdir(resolve(root, "features/serializers/html/generated"), { recursive: true })
await writeFile(
  outputPath,
  `export default ${JSON.stringify(result.outputFiles[0].text)}\n`,
)
