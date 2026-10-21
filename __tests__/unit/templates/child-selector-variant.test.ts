import fs from "node:fs"
import path from "node:path"

const TEMPLATE_DIR = path.join(process.cwd(), "client/features/templates/definitions")
const GLOBALS_CSS = path.join(process.cwd(), "app/globals.css")

describe("direct-child utilities in templates (ADR 0016)", () => {
  const files = fs.readdirSync(TEMPLATE_DIR).filter((name) => name.endsWith(".ts"))

  it.each(files)("%s uses the `kids:` variant, not a bare child combinator", (file) => {
    const source = fs.readFileSync(path.join(TEMPLATE_DIR, file), "utf8")
    // `[&>*]:` and `*:` match the editor-controls wrapper in Edit Mode, not the component inside it.
    expect(source).not.toMatch(/\[&>\*\]:/)
    expect(source).not.toMatch(/(^|[\s"'`:])\*:[!a-z]/)
  })

  it("defines the kids variant so that it matches through the editor wrapper", () => {
    const css = fs.readFileSync(GLOBALS_CSS, "utf8")
    expect(css).toMatch(/@custom-variant kids \(& > \*, & > \[data-component-id\] > \*\);/)
  })
})
