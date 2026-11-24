import { render, screen } from "@testing-library/react"
import Home from "@/app/page"

describe("Landing page CTAs", () => {
  it("renders CTAs as single links with correct hrefs and accessible names", () => {
    render(<Home />)

    const links = [
      { name: "Open builder", href: "/try" },
      { name: /Start building/, href: "/try" },
      { name: /See how it works/, href: "#how-it-works" },
      { name: /Open LivePage/, href: "/try" },
    ]

    for (const { name, href } of links) {
      const link = screen.getByRole("link", { name })
      expect(link).toHaveAttribute("href", href)
      expect(link.tagName).toBe("A")
      // No nested button
      expect(link.querySelector("button")).toBeNull()
      expect(link.closest("button")).toBeNull()
    }
  })
})
