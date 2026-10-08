import { build } from "esbuild"
import postcss from "postcss"
import tailwindcss from "@tailwindcss/postcss"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const root = resolve(new URL("..", import.meta.url).pathname)
const result = await build({
  entryPoints: [resolve(root, "client/features/serializers/html/browser-runtime.tsx")],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  jsx: "automatic",
  jsxImportSource: "react",
  external: [
    "react",
    "react-dom/client",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
    "https://esm.sh/*",
  ],
  minify: true,
  write: false,
  legalComments: "none",
})

const bundledRuntime = result.outputFiles[0].text
  .replace(/(from\s*)["']react-dom\/client["']/g, '$1"https://esm.sh/react-dom@19.1.0/client"')
  .replace(/(from\s*)["']react\/jsx-runtime["']/g, '$1"https://esm.sh/react@19.1.0/jsx-runtime"')
  .replace(/(from\s*)["']react\/jsx-dev-runtime["']/g, '$1"https://esm.sh/react@19.1.0/jsx-dev-runtime"')
  .replace(/(from\s*)["']react["']/g, '$1"https://esm.sh/react@19.1.0"')
const runtime = `import __livepageReact from "https://esm.sh/react@19.1.0";
const require = (specifier) => {
  if (specifier === "react") return __livepageReact;
  throw new Error(\`Unsupported bundled runtime dependency: \${specifier}\`);
};
${bundledRuntime}`

const standaloneResult = await build({
  entryPoints: [resolve(root, "client/features/serializers/html/browser-runtime.tsx")],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  jsx: "automatic",
  jsxImportSource: "react",
  minify: true,
  write: false,
  legalComments: "none",
})

const standaloneRuntime = standaloneResult.outputFiles[0].text
if (/from\s*["']https?:/.test(standaloneRuntime) || /from\s*["']react/.test(standaloneRuntime)) {
  throw new Error("Self-contained HTML runtime still has external imports")
}
const globalsPath = resolve(root, "app/globals.css")
const globals = await readFile(globalsPath, "utf8")
const compiledStyles = await postcss([tailwindcss()]).process(globals, {
  from: globalsPath,
})

const generatedPath = resolve(root, "client/features/serializers/html/generated")
await mkdir(generatedPath, { recursive: true })
await writeFile(
  resolve(generatedPath, "browser-runtime.js"),
  `export default ${JSON.stringify(runtime)}\n`,
)
await writeFile(
  resolve(generatedPath, "browser-runtime-self-contained.js"),
  `export default ${JSON.stringify(standaloneRuntime)}\n`,
)
await writeFile(
  resolve(generatedPath, "browser-styles.js"),
  `export default ${JSON.stringify(compiledStyles.css)}\n`,
)
