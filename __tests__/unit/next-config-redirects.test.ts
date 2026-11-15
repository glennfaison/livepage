/**
 * Ensures the permanent /template-art → /page-template-art redirect stays
 * in next.config (issue #515). Old paths are embedded in saved pages and
 * standalone HTML exports.
 */
import nextConfig from "../../next.config";

describe("next.config redirects (page-template-art)", () => {
  it("declares a permanent redirect from /template-art/:path* to /page-template-art/:path*", async () => {
    expect(typeof nextConfig.redirects).toBe("function");
    const redirects = await nextConfig.redirects!();
    const rule = redirects.find(
      (r) => r.source === "/template-art/:path*" && r.destination === "/page-template-art/:path*",
    );
    expect(rule).toBeDefined();
    expect(rule!.permanent).toBe(true);
  });
});
