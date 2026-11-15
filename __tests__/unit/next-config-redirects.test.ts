import nextConfig from "../../next.config"

describe("next.config redirects", () => {
  it("permanently redirects old /template-art paths to /page-template-art", async () => {
    const redirects = await nextConfig.redirects?.()
    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/template-art/:path*",
          destination: "/page-template-art/:path*",
          permanent: true,
        }),
      ]),
    )
  })
})
