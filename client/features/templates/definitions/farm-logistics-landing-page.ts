import type { PageTemplateDefinition } from "@/client/features/templates/schema"

type TemplateNode = Readonly<{
  tag: string
  attributes: Readonly<Record<string, string>>
  children: ReadonlyArray<TemplateNode | string>
}>

function node(
  tag: string,
  id: string,
  attributes: Readonly<Record<string, string>> = {},
  children: ReadonlyArray<TemplateNode | string> = [],
): TemplateNode {
  return { tag, attributes: { id, ...attributes }, children } as const
}

const text = (
  tag: "header1" | "header2" | "header3" | "paragraph" | "badge" | "button" | "callout" | "inline-text",
  id: string,
  content: string,
  attributes: Readonly<Record<string, string>> = {},
) => node(tag, id, attributes, [content])

// Layout helpers. Spacing is set by attribute because inline styles beat Tailwind padding classes.
const centered = { "margin-left": "auto", "margin-right": "auto" } as const
const padding = (top: string, sides: string, bottom: string = top) => ({
  "padding-top": top, "padding-right": sides, "padding-bottom": bottom, "padding-left": sides,
}) as const
const boxPadding = (all: string) => padding(all, all)

// Class strings are written out in full so Tailwind can see every class.
const CARD = "min-w-0 rounded-2xl border-2 border-[#1b1b18] bg-[#fffdf6] shadow-[4px_4px_0_0_#1b1b18]"
const EYEBROW = "w-fit rounded-md border-2 border-[#1b1b18] bg-[#f5b82e] px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.08em] text-[#1b1b18]"
const HEADING = "py-0 text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-[#1b1b18] md:text-5xl"
const LEAD = "py-0 text-base leading-7 text-[#4a4a42] md:text-lg"
const CARD_TITLE = "py-0 text-xl font-bold tracking-[-0.01em] text-[#1b1b18]"
const CARD_BODY = "py-0 text-[0.95rem] leading-6 text-[#4a4a42]"
const BUTTON_PRIMARY = "rounded-lg border-2 border-[#1b1b18] bg-[#2e7d32] px-5 font-semibold text-white shadow-[3px_3px_0_0_#1b1b18] hover:bg-[#256628]"
const BUTTON_OUTLINE = "inline-flex items-center rounded-lg border-2 border-[#1b1b18] bg-[#fffdf6] px-5 py-2.5 text-sm font-semibold text-[#1b1b18] hover:bg-[#f5b82e]"
const SHELL = "mx-auto w-full max-w-6xl"
// Rows give children `flex-1 basis-0`, which collapses them to zero height once the row stacks. Reset that while
// stacked and restore equal columns from the breakpoint up.
const STACK_MD = "min-h-0 flex-col md:flex-row [&>*]:!flex-none md:[&>*]:!flex-1"
const STACK_LG = "min-h-0 flex-col lg:flex-row [&>*]:!flex-none lg:[&>*]:!flex-1"

const services = [
  { key: "bulk", number: "01", title: "Large bulk orders", body: "Pool harvests from nearby farms to fill pallet, container and truckload orders from wholesalers and food processors." },
  { key: "retail", number: "02", title: "Retail orders", body: "Sell smaller, regular volumes to grocers, restaurants and box schemes, with fixed weekly pickups you can plan around." },
  { key: "transport", number: "03", title: "Shops, markets and supermarkets", body: "Scheduled routes to shops, open-air markets and supermarket depots, with proof of delivery on every drop." },
  { key: "export", number: "04", title: "Export preparation", body: "Grading, packing, documentation and cold chain, handled to the standard your destination market expects." },
  { key: "storage", number: "05", title: "Longer-term transport and storage", body: "Temperature-controlled storage and contracted haulage for crops that need to wait for the right price." },
] as const

const steps = [
  { key: "list", title: "List your produce", body: "Tell us what you have, how much, and when it is ready. A few photos and a rough weight are enough." },
  { key: "match", title: "Match a buyer", body: "We match your listing to open orders and quote a delivered price before you commit to anything." },
  { key: "collect", title: "We collect and pack", body: "A driver collects from your gate, then our crew grades, packs and labels the load for its destination." },
  { key: "paid", title: "Delivered and paid", body: "The buyer signs on delivery and payment reaches your account within three working days." },
] as const

const stats = [
  { key: "tonnes", value: "48,000", label: "Tonnes moved last year" },
  { key: "farms", value: "3,200", label: "Farms and co-ops served" },
  { key: "ontime", value: "98.4%", label: "Deliveries on time" },
  { key: "markets", value: "61", label: "Markets reached" },
] as const

const stories = [
  {
    key: "amina", avatar: "/avatars/amina-diallo.svg", name: "Amina Diallo", role: "Maize and bean grower, Diallo Family Farm",
    quote: "I used to wait weeks for a trader to turn up. Now I list on Monday, the truck arrives Thursday, and I am paid before the next planting.",
  },
  {
    key: "tomas", avatar: "/avatars/tomas-herrera.svg", name: "Tomás Herrera", role: "Produce buyer, BrightBasket Supermarkets",
    quote: "Our shelves are fuller and the fruit arrives colder. Every pallet comes with a temperature log, so receiving takes minutes instead of hours.",
  },
  {
    key: "grace", avatar: "/avatars/grace-njoroge.svg", name: "Grace Njoroge", role: "Manager, Hilltop Growers Co-op",
    quote: "Forty members, one booking. Fieldrun pooled our harvest into a single export load and handled every form, grading to customs.",
  },
] as const

const plans = [
  {
    key: "smallholder", name: "Smallholder", price: "Free", note: "plus 7% of each delivered order", featured: false,
    blurb: "For individual farms moving up to 5 tonnes a month.",
    features: ["Marketplace listings", "Pickup and delivery to local markets", "Pay-on-delivery settlement", "Email and chat support"],
    cta: "Start for free",
  },
  {
    key: "coop", name: "Co-op", price: "$149", note: "per month, plus 4% of each delivered order", featured: true,
    blurb: "For co-operatives pooling harvests from many farms.",
    features: ["Everything in Smallholder", "Pooled bulk and retail orders", "Shared storage booking", "A named account manager"],
    cta: "Get started",
  },
  {
    key: "exporter", name: "Exporter", price: "$499", note: "per month, plus 2.5% of each delivered order", featured: false,
    blurb: "For growers and packers selling across borders.",
    features: ["Everything in Co-op", "Grading, packing and documentation", "Cold chain with live temperature logs", "Dedicated logistics manager"],
    cta: "Talk to sales",
  },
] as const

const faqs = [
  { key: "pickup", question: "How quickly can you collect?", answer: "Within 48 hours in our covered regions, and same day for cold-chain pickups booked before 10am." },
  { key: "packaging", question: "Do I need my own packaging?", answer: "No. We supply crates, liners and labels at cost, or you can use your own if they meet the buyer's specification." },
  { key: "reject", question: "What happens if a buyer rejects a load?", answer: "We re-route it to another buyer or to storage at no extra haulage cost. If the fault is ours, you are paid in full." },
  { key: "export", question: "Can I export if I have never done it before?", answer: "Yes. Our export desk prepares the grading, phytosanitary paperwork and customs documents, and walks you through each step." },
  { key: "payment", question: "How and when do I get paid?", answer: "Payment is released within three working days of the buyer signing for delivery, straight to your bank or mobile money account." },
] as const

const footerColumns = [
  { key: "product", heading: "Product", links: [["Services", "#farm-services"], ["How it works", "#farm-how"], ["Pricing", "#farm-pricing"]] },
  { key: "company", heading: "Company", links: [["Customer stories", "#farm-stories"], ["Questions", "#farm-faq"], ["Sign in", "https://example.com/sign-in"]] },
] as const

const navLink = (id: string, label: string, href: string) =>
  node("link", id, { href, "custom-classes": "text-sm font-semibold text-[#1b1b18] no-underline hover:underline" }, [label])

export const farmLogisticsLandingPageTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "farm-logistics-landing-page",
  metadata: {
    name: "Landing Page / Farm Logistics",
    description: "A dense, confident landing page for a farm-to-market logistics company, with services, how it works, stats, stories, pricing and FAQ.",
    category: "Landing Page",
    tags: ["landing page", "logistics", "agriculture", "farm", "marketplace", "pricing", "linkedin import"],
    thumbnail: "/template-thumbnails/farm-logistics-landing-page.svg",
  },
  dataMapping: {
    source: "linkedin-profile",
    fields: [
      {
        source: "name",
        description: "Reused as the company name in the nav and footer.",
        targets: [
          { componentId: "farm-nav-brand", kind: "text", field: "children" },
          { componentId: "farm-footer-brand", kind: "text", field: "children" },
        ],
      },
      {
        source: "headline",
        description: "Reused as the hero headline.",
        targets: [{ componentId: "farm-hero-headline", kind: "text", field: "children" }],
      },
      {
        source: "summary",
        description: "Reused as the hero supporting line.",
        targets: [{ componentId: "farm-hero-copy", kind: "text", field: "children" }],
      },
      {
        source: "positions",
        description: "Repeatable entries reinterpreted as services: position title becomes the service name and its highlights become the service description.",
        repeatable: true,
        targets: [{ componentId: "farm-services-grid", kind: "attribute", field: "children[]" }],
      },
      {
        source: "skills",
        description: "Reused as the partner and market names in the social-proof strip.",
        repeatable: true,
        targets: [{ componentId: "farm-proof-logos", kind: "attribute", field: "children[]" }],
      },
      {
        source: "email",
        description: "Reused as the footer contact link.",
        targets: [{ componentId: "farm-footer-contact", kind: "attribute", field: "href" }],
      },
    ],
  },
  content: {
    pages: [
      node("page", "farm-logistics-template-page", {
        title: "Fieldrun Farm Logistics",
        "custom-classes": "overflow-hidden rounded-none border-0 bg-[#f4f1e8] text-[#1b1b18] shadow-none",
      }, [
        node("column", "farm-shell", { gap: "0", "custom-classes": "mx-auto w-full" }, [
          // 1. Navbar
          node("row", "farm-nav", {
            ...padding("1.25rem", "1.5rem"), ...centered,
            "child-sizing": "natural", "align-items": "center", "justify-content": "between", gap: "1rem",
            "custom-classes": `${SHELL} [&>*]:!self-center`,
          }, [
            node("row", "farm-nav-brandmark", { "child-sizing": "natural", "align-items": "center", gap: "0.6rem", "custom-classes": "min-h-0 [&>*]:!self-center" }, [
              node("image", "farm-nav-logo", {
                alt: "Fieldrun logo", src: "", fallbackSrc: "/template-art/farm-logistics-logo.svg",
                width: "36px", height: "36px", objectFit: "contain", loading: "lazy", decoding: "async",
                "custom-classes": "shrink-0",
              }),
              text("inline-text", "farm-nav-brand", "Fieldrun", { "custom-classes": "text-xl font-extrabold tracking-[-0.03em] text-[#1b1b18]" }),
            ]),
            node("row", "farm-nav-links", {
              "child-sizing": "natural", "align-items": "center", gap: "1.75rem",
              "custom-classes": "hidden min-h-0 md:flex [&>*]:!self-center",
            }, [
              navLink("farm-nav-link-services", "Services", "#farm-services"),
              navLink("farm-nav-link-how", "How it works", "#farm-how"),
              navLink("farm-nav-link-pricing", "Pricing", "#farm-pricing"),
              navLink("farm-nav-link-stories", "Stories", "#farm-stories"),
            ]),
            node("row", "farm-nav-actions", { "child-sizing": "natural", "align-items": "center", gap: "1rem", "custom-classes": "min-h-0 [&>*]:!self-center" }, [
              node("link", "farm-nav-signin", { href: "https://example.com/sign-in", "custom-classes": "hidden text-sm font-semibold text-[#1b1b18] no-underline hover:underline sm:inline" }, ["Sign in"]),
              node("button", "farm-nav-cta", { variant: "default", size: "sm", "custom-classes": "rounded-lg border-2 border-[#1b1b18] bg-[#f5b82e] px-4 font-bold text-[#1b1b18] shadow-[2px_2px_0_0_#1b1b18] hover:bg-[#f7c653]" }, ["Get started"]),
            ]),
          ]),

          // 2. Hero
          node("row", "farm-hero", {
            ...padding("2.5rem", "1.5rem", "4.5rem"), ...centered,
            gap: "3rem",
            "custom-classes": `${SHELL} ${STACK_MD} md:items-center`,
          }, [
            node("column", "farm-hero-copy-col", { gap: "1.5rem", "align-items": "start", "justify-content": "center" }, [
              text("badge", "farm-hero-badge", "Farm-to-market logistics, built by growers", { variant: "outline", "custom-classes": EYEBROW }),
              text("header1", "farm-hero-headline", "Get your harvest to market while it is still at its best.", {
                "custom-classes": "py-0 text-[2.5rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#1b1b18] md:text-[3.75rem]",
              }),
              text("paragraph", "farm-hero-copy", "Fieldrun connects farmers with buyers, then handles the trucks, cold chain and paperwork in between. List your produce in minutes, we collect and deliver, and you are paid when it lands.", { "custom-classes": `${LEAD} max-w-xl` }),
              node("row", "farm-hero-actions", { "child-sizing": "natural", "align-items": "center", gap: "0.75rem", "custom-classes": "min-h-0 flex-wrap [&>*]:!self-center" }, [
                node("button", "farm-hero-cta-primary", { variant: "default", size: "lg", "custom-classes": BUTTON_PRIMARY }, ["Get started free"]),
                node("link", "farm-hero-cta-secondary", { href: "#farm-pricing", "custom-classes": BUTTON_OUTLINE }, ["See pricing"]),
              ]),
              text("paragraph", "farm-hero-note", "Free for smallholders up to 5 tonnes a month. No contract, no setup fee.", { "custom-classes": "py-0 text-sm text-[#6b6b60]" }),
            ]),
            node("column", "farm-hero-art-col", { "justify-content": "center" }, [
              node("image", "farm-hero-image", {
                alt: "A refrigerated Fieldrun truck loaded with produce, with crates of tomatoes waiting beside the farm road",
                src: "", fallbackSrc: "/template-art/farm-logistics-hero.svg",
                width: "100%", height: "auto", objectFit: "cover", borderRadius: "20px", loading: "eager", decoding: "async",
                "custom-classes": "w-full overflow-hidden rounded-2xl border-2 border-[#1b1b18] bg-[#fbe3a0] shadow-[6px_6px_0_0_#1b1b18]",
              }),
            ]),
          ]),

          // 3. Social proof
          node("column", "farm-proof", { gap: "0", "custom-classes": "w-full border-y-2 border-[#1b1b18] bg-[#fffdf6]" }, [
            node("column", "farm-proof-inner", {
              ...padding("1.75rem", "1.5rem"), ...centered, gap: "1.25rem", "align-items": "center",
              "custom-classes": SHELL,
            }, [
              text("paragraph", "farm-proof-label", "Trusted by 3,200 farms, 140 co-ops and the markets they sell to", { "custom-classes": "py-0 text-center text-sm font-semibold text-[#6b6b60]" }),
              node("row", "farm-proof-logos", {
                "child-sizing": "natural", "align-items": "center", "justify-content": "center", gap: "0.75rem 1.75rem",
                "custom-classes": "min-h-0 flex-wrap [&>*]:!self-center",
              }, [
                text("inline-text", "farm-proof-1", "GREENMARKET CO-OP", { "custom-classes": "text-sm font-black tracking-[0.12em] text-[#1b1b18]" }),
                text("inline-text", "farm-proof-2", "Hilltop Fresh Markets", { "custom-classes": "text-base font-extrabold italic tracking-[-0.02em] text-[#2e7d32]" }),
                text("inline-text", "farm-proof-3", "BrightBasket", { "custom-classes": "text-base font-black tracking-[-0.03em] text-[#e4572e]" }),
                text("inline-text", "farm-proof-4", "NORTHFIELD GROWERS", { "custom-classes": "text-sm font-black tracking-[0.12em] text-[#1b1b18]" }),
                text("inline-text", "farm-proof-5", "Savanna Export Group", { "custom-classes": "text-base font-extrabold tracking-[-0.02em] text-[#14532d]" }),
                text("inline-text", "farm-proof-6", "riverbend co-op", { "custom-classes": "font-mono text-base font-bold text-[#1b1b18]" }),
              ]),
            ]),
          ]),

          // 4. Services
          node("column", "farm-services", {
            ...padding("5rem", "1.5rem"), ...centered, gap: "2.5rem",
            "custom-classes": SHELL,
          }, [
            node("column", "farm-services-intro", { gap: "0.9rem", "align-items": "start", "custom-classes": "max-w-3xl" }, [
              text("badge", "farm-services-eyebrow", "Services", { variant: "outline", "custom-classes": EYEBROW }),
              text("header2", "farm-services-heading", "Everything between the field and the shelf.", { "custom-classes": HEADING }),
              text("paragraph", "farm-services-copy", "Pick one service or run the whole chain with us. Every order is tracked from your gate to the buyer's dock.", { "custom-classes": LEAD }),
            ]),
            node("row", "farm-services-grid", {
              "child-sizing": "natural", gap: "1.5rem",
              "custom-classes": "min-h-0 flex-wrap",
            }, [
              ...services.map((service) => node("column", `farm-service-${service.key}`, {
                ...boxPadding("1.5rem"), gap: "0.75rem",
                "custom-classes": `${CARD} w-full md:w-[calc((100%-3rem)/3)]`,
              }, [
                text("badge", `farm-service-${service.key}-number`, service.number, { variant: "outline", "custom-classes": "w-fit rounded-md border-2 border-[#1b1b18] bg-[#cfe8c9] px-2 py-0.5 font-mono text-xs font-bold text-[#1b1b18]" }),
                text("header3", `farm-service-${service.key}-title`, service.title, { "custom-classes": CARD_TITLE }),
                text("paragraph", `farm-service-${service.key}-body`, service.body, { "custom-classes": CARD_BODY }),
              ])),
              node("column", "farm-service-custom", {
                ...boxPadding("1.5rem"), gap: "0.75rem", "justify-content": "between",
                "custom-classes": "min-w-0 w-full rounded-2xl border-2 border-[#1b1b18] bg-[#1b1b18] shadow-[4px_4px_0_0_#f5b82e] md:w-[calc((100%-3rem)/3)]",
              }, [
                node("column", "farm-service-custom-copy", { gap: "0.75rem" }, [
                  text("header3", "farm-service-custom-title", "Not sure what you need?", { "custom-classes": "py-0 text-xl font-bold tracking-[-0.01em] text-[#f4f1e8]" }),
                  text("paragraph", "farm-service-custom-body", "Tell us what you grow and where it needs to go. We will map a route and a price within two working days.", { "custom-classes": "py-0 text-[0.95rem] leading-6 text-[#d6d2c4]" }),
                ]),
                node("button", "farm-service-custom-cta", { variant: "default", size: "default", "custom-classes": "w-fit rounded-lg border-2 border-[#f4f1e8] bg-[#f5b82e] px-5 font-bold text-[#1b1b18] hover:bg-[#f7c653]" }, ["Talk to a logistics lead"]),
              ]),
            ]),
          ]),

          // 5. How it works
          node("column", "farm-how", { gap: "0", "custom-classes": "w-full border-y-2 border-[#1b1b18] bg-[#dcebcf]" }, [
            node("column", "farm-how-inner", {
              ...padding("5rem", "1.5rem"), ...centered, gap: "2.5rem",
              "custom-classes": SHELL,
            }, [
              node("column", "farm-how-intro", { gap: "0.9rem", "align-items": "start", "custom-classes": "max-w-3xl" }, [
                text("badge", "farm-how-eyebrow", "How it works", { variant: "outline", "custom-classes": EYEBROW }),
                text("header2", "farm-how-heading", "From your field to paid in four steps.", { "custom-classes": HEADING }),
              ]),
              node("row", "farm-how-steps", { gap: "1.5rem", "custom-classes": STACK_LG }, [
                ...steps.map((step, index) => node("column", `farm-step-${step.key}`, {
                  ...boxPadding("1.5rem"), gap: "0.75rem",
                  "custom-classes": CARD,
                }, [
                  text("badge", `farm-step-${step.key}-number`, `Step ${index + 1}`, { variant: "outline", "custom-classes": "w-fit rounded-md border-2 border-[#1b1b18] bg-[#f5b82e] px-2 py-0.5 font-mono text-xs font-bold text-[#1b1b18]" }),
                  text("header3", `farm-step-${step.key}-title`, step.title, { "custom-classes": CARD_TITLE }),
                  text("paragraph", `farm-step-${step.key}-body`, step.body, { "custom-classes": CARD_BODY }),
                ])),
              ]),
            ]),
          ]),

          // 6. Big stats
          node("column", "farm-stats", { gap: "0", "custom-classes": "w-full bg-[#1b1b18]" }, [
            node("column", "farm-stats-inner", {
              ...padding("5rem", "1.5rem"), ...centered, gap: "2.5rem",
              "custom-classes": SHELL,
            }, [
              node("column", "farm-stats-intro", { gap: "0.9rem", "align-items": "start", "custom-classes": "max-w-3xl" }, [
                text("header2", "farm-stats-heading", "The numbers behind the trucks.", { "custom-classes": "py-0 text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-[#f4f1e8] md:text-5xl" }),
                text("paragraph", "farm-stats-copy", "Reliable logistics is a habit. Here is what that habit looked like over the last twelve months.", { "custom-classes": "py-0 text-base leading-7 text-[#d6d2c4] md:text-lg" }),
              ]),
              node("row", "farm-stats-row", { gap: "1.25rem", "custom-classes": STACK_LG }, [
                ...stats.map((stat) => node("stat", `farm-stat-${stat.key}`, {
                  value: stat.value,
                  "custom-classes": "rounded-2xl border-2 border-[#f4f1e8] bg-[#fffdf6] p-6 shadow-[4px_4px_0_0_#f5b82e] [&>p:first-child]:text-5xl [&>p:first-child]:font-extrabold [&>p:first-child]:tracking-[-0.04em] [&>p:first-child]:text-[#1b1b18] [&>p:last-child]:mt-2 [&>p:last-child]:text-base [&>p:last-child]:text-[#4a4a42]",
                }, [stat.label])),
              ]),
            ]),
          ]),

          // 7. Customer stories
          node("column", "farm-stories", {
            ...padding("5rem", "1.5rem"), ...centered, gap: "2.5rem",
            "custom-classes": SHELL,
          }, [
            node("column", "farm-stories-intro", { gap: "0.9rem", "align-items": "start", "custom-classes": "max-w-3xl" }, [
              text("badge", "farm-stories-eyebrow", "Customer stories", { variant: "outline", "custom-classes": EYEBROW }),
              text("header2", "farm-stories-heading", "Growers and buyers, on the record.", { "custom-classes": HEADING }),
            ]),
            node("row", "farm-stories-list", { gap: "1.5rem", "custom-classes": STACK_MD }, [
              ...stories.map((story) => node("column", `farm-story-${story.key}`, {
                ...boxPadding("1.75rem"), gap: "1.5rem", "justify-content": "between",
                "custom-classes": CARD,
              }, [
                text("paragraph", `farm-story-${story.key}-quote`, story.quote, { "custom-classes": "py-0 text-base leading-7 text-[#1b1b18]" }),
                node("row", `farm-story-${story.key}-person`, { "child-sizing": "natural", "align-items": "center", gap: "0.85rem", "custom-classes": "min-h-0 [&>*]:!self-center" }, [
                  node("image", `farm-story-${story.key}-avatar`, {
                    alt: `${story.name} portrait`, src: "", fallbackSrc: story.avatar,
                    width: "48px", height: "48px", objectFit: "cover", borderRadius: "9999px", loading: "lazy", decoding: "async",
                    "custom-classes": "shrink-0 overflow-hidden rounded-full border-2 border-[#1b1b18] bg-[#fde68a]",
                  }),
                  node("column", `farm-story-${story.key}-who`, { gap: "0.1rem", "custom-classes": "min-w-0" }, [
                    text("inline-text", `farm-story-${story.key}-name`, story.name, { "custom-classes": "text-sm font-bold text-[#1b1b18]" }),
                    text("inline-text", `farm-story-${story.key}-role`, story.role, { "custom-classes": "text-xs leading-5 text-[#6b6b60]" }),
                  ]),
                ]),
              ])),
            ]),
          ]),

          // 8. Pricing
          node("column", "farm-pricing", { gap: "0", "custom-classes": "w-full border-y-2 border-[#1b1b18] bg-[#fbe3a0]" }, [
            node("column", "farm-pricing-inner", {
              ...padding("5rem", "1.5rem"), ...centered, gap: "2.5rem",
              "custom-classes": SHELL,
            }, [
              node("column", "farm-pricing-intro", { gap: "0.9rem", "align-items": "start", "custom-classes": "max-w-3xl" }, [
                text("badge", "farm-pricing-eyebrow", "Pricing", { variant: "outline", "custom-classes": "w-fit rounded-md border-2 border-[#1b1b18] bg-[#fffdf6] px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.08em] text-[#1b1b18]" }),
                text("header2", "farm-pricing-heading", "Plans that grow with your harvest.", { "custom-classes": HEADING }),
                text("paragraph", "farm-pricing-copy", "Start free, and move up when your volumes do. You only pay delivery fees on orders that arrive.", { "custom-classes": "py-0 text-base leading-7 text-[#4a4a42] md:text-lg" }),
              ]),
              node("row", "farm-pricing-plans", { gap: "1.5rem", "custom-classes": STACK_MD }, [
                ...plans.map((plan) => node("column", `farm-plan-${plan.key}`, {
                  ...boxPadding("1.75rem"), gap: "1.5rem", "justify-content": "between",
                  "custom-classes": plan.featured
                    ? "min-w-0 rounded-2xl border-2 border-[#1b1b18] bg-[#2e7d32] shadow-[6px_6px_0_0_#1b1b18]"
                    : CARD,
                }, [
                  node("column", `farm-plan-${plan.key}-body`, { gap: "0.75rem" }, [
                    text("badge", `farm-plan-${plan.key}-name`, plan.featured ? `${plan.name} · Most popular` : plan.name, {
                      variant: "outline",
                      "custom-classes": plan.featured
                        ? "w-fit rounded-md border-2 border-[#1b1b18] bg-[#f5b82e] px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.08em] text-[#1b1b18]"
                        : "w-fit rounded-md border-2 border-[#1b1b18] bg-[#cfe8c9] px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.08em] text-[#1b1b18]",
                    }),
                    text("header2", `farm-plan-${plan.key}-price`, plan.price, {
                      "custom-classes": plan.featured
                        ? "py-0 text-5xl font-extrabold tracking-[-0.04em] text-white"
                        : "py-0 text-5xl font-extrabold tracking-[-0.04em] text-[#1b1b18]",
                    }),
                    text("paragraph", `farm-plan-${plan.key}-note`, plan.note, {
                      "custom-classes": plan.featured ? "py-0 text-sm text-[#f2faf0]" : "py-0 text-sm text-[#6b6b60]",
                    }),
                    text("paragraph", `farm-plan-${plan.key}-blurb`, plan.blurb, {
                      "custom-classes": plan.featured ? "py-0 pt-2 text-[0.95rem] font-semibold leading-6 text-white" : "py-0 pt-2 text-[0.95rem] font-semibold leading-6 text-[#1b1b18]",
                    }),
                    node("column", `farm-plan-${plan.key}-features`, { gap: "0.5rem", "custom-classes": "pt-1" }, [
                      ...plan.features.map((feature, index) => text("paragraph", `farm-plan-${plan.key}-feature-${index + 1}`, `✓ ${feature}`, {
                        "custom-classes": plan.featured ? "py-0 text-sm leading-6 text-[#eaf6e7]" : "py-0 text-sm leading-6 text-[#4a4a42]",
                      })),
                    ]),
                  ]),
                  node("button", `farm-plan-${plan.key}-cta`, {
                    variant: "default", size: "default",
                    "custom-classes": plan.featured
                      ? "w-full rounded-lg border-2 border-[#1b1b18] bg-[#f5b82e] font-bold text-[#1b1b18] shadow-[3px_3px_0_0_#1b1b18] hover:bg-[#f7c653]"
                      : "w-full rounded-lg border-2 border-[#1b1b18] bg-[#1b1b18] font-bold text-[#f4f1e8] hover:bg-[#33332e]",
                  }, [plan.cta]),
                ])),
              ]),
            ]),
          ]),

          // 9. FAQ
          node("column", "farm-faq", {
            ...padding("5rem", "1.5rem"), ...centered, gap: "2rem",
            "custom-classes": "mx-auto w-full max-w-3xl",
          }, [
            node("column", "farm-faq-intro", { gap: "0.9rem", "align-items": "start" }, [
              text("badge", "farm-faq-eyebrow", "FAQ", { variant: "outline", "custom-classes": EYEBROW }),
              text("header2", "farm-faq-heading", "Questions growers ask us.", { "custom-classes": HEADING }),
            ]),
            node("column", "farm-faq-list", { gap: "1rem" }, [
              ...faqs.map((faq) => node("column", `farm-faq-${faq.key}`, {
                ...boxPadding("1.25rem"), gap: "0.4rem",
                "custom-classes": "min-w-0 rounded-xl border-2 border-[#1b1b18] bg-[#fffdf6]",
              }, [
                text("header3", `farm-faq-${faq.key}-question`, faq.question, { "custom-classes": "py-0 text-base font-bold text-[#1b1b18]" }),
                text("paragraph", `farm-faq-${faq.key}-answer`, faq.answer, { "custom-classes": CARD_BODY }),
              ])),
            ]),
          ]),

          // 10. Final CTA and footer
          node("column", "farm-cta", { gap: "0", "custom-classes": "w-full border-t-2 border-[#1b1b18] bg-[#f5b82e]" }, [
            node("column", "farm-cta-inner", {
              ...padding("5rem", "1.5rem"), ...centered, gap: "1.5rem", "align-items": "center",
              "custom-classes": "mx-auto w-full max-w-4xl text-center",
            }, [
              text("header2", "farm-cta-heading", "Your next harvest has somewhere to be.", { "custom-classes": `${HEADING} text-center` }),
              text("paragraph", "farm-cta-copy", "Create a free account, list what is ready, and have a quote in your inbox before the end of the day.", { "custom-classes": "max-w-xl py-0 text-center text-base leading-7 text-[#3a3418] md:text-lg" }),
              node("row", "farm-cta-actions", { "child-sizing": "natural", "align-items": "center", "justify-content": "center", gap: "0.75rem", "custom-classes": "min-h-0 flex-wrap [&>*]:!self-center" }, [
                node("button", "farm-cta-primary", { variant: "default", size: "lg", "custom-classes": "rounded-lg border-2 border-[#1b1b18] bg-[#1b1b18] px-6 font-bold text-[#f4f1e8] shadow-[3px_3px_0_0_#fffdf6] hover:bg-[#33332e]" }, ["Get started free"]),
                node("link", "farm-cta-secondary", { href: "#farm-services", "custom-classes": BUTTON_OUTLINE }, ["Explore services"]),
              ]),
            ]),
          ]),
          node("column", "farm-footer", { gap: "0", "custom-classes": "w-full border-t-2 border-[#1b1b18] bg-[#1b1b18]" }, [
            node("column", "farm-footer-inner", {
              ...padding("3rem", "1.5rem", "2.5rem"), ...centered, gap: "1.5rem",
              "custom-classes": SHELL,
            }, [
              node("row", "farm-footer-columns", { gap: "2rem", "custom-classes": STACK_MD }, [
                node("column", "farm-footer-about", { gap: "0.75rem" }, [
                  text("inline-text", "farm-footer-brand", "Fieldrun", { "custom-classes": "text-xl font-extrabold tracking-[-0.03em] text-[#f4f1e8]" }),
                  text("paragraph", "farm-footer-tagline", "Farm to market, handled. Logistics for growers, co-ops and the buyers who depend on them.", { "custom-classes": "max-w-xs py-0 text-sm leading-6 text-[#bdb9aa]" }),
                ]),
                ...footerColumns.map((column) => node("column", `farm-footer-${column.key}`, { gap: "0.6rem" }, [
                  text("header3", `farm-footer-${column.key}-heading`, column.heading, { "custom-classes": "py-0 text-xs font-bold uppercase tracking-[0.12em] text-[#f5b82e]" }),
                  ...column.links.map(([label, href], index) => node("link", `farm-footer-${column.key}-link-${index + 1}`, { href, "custom-classes": "text-sm text-[#f4f1e8] no-underline hover:underline" }, [label])),
                ])),
                node("column", "farm-footer-contact-col", { gap: "0.6rem" }, [
                  text("header3", "farm-footer-contact-heading", "Contact", { "custom-classes": "py-0 text-xs font-bold uppercase tracking-[0.12em] text-[#f5b82e]" }),
                  node("link", "farm-footer-contact", { href: "mailto:hello@example.com", "custom-classes": "text-sm text-[#f4f1e8] no-underline hover:underline" }, ["hello@example.com"]),
                  text("paragraph", "farm-footer-hours", "Mon–Sat, 6am to 8pm", { "custom-classes": "py-0 text-sm text-[#bdb9aa]" }),
                ]),
              ]),
              node("divider", "farm-footer-divider", { color: "#3a3a35", style: "solid" }),
              text("paragraph", "farm-footer-legal", "© 2026 Fieldrun Logistics. A fictional company used to demonstrate this template.", { "custom-classes": "py-0 text-xs text-[#8a8a7e]" }),
            ]),
          ]),
        ]),
      ]),
    ],
  },
} as const satisfies PageTemplateDefinition
