import { weddingInvitationTemplate } from "./wedding-invitation"
import { parsePageTemplateDefinition } from "../schema"

describe("weddingInvitationTemplate", () => {
  it("parses as a valid PageTemplateDefinition", () => {
    expect(() => parsePageTemplateDefinition(weddingInvitationTemplate)).not.toThrow()
  })
})
