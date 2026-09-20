import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Code2, Download, Layers3, MousePointer2, Sparkles, WandSparkles } from "lucide-react"

const features = [
  {
    icon: MousePointer2,
    eyebrow: "Compose",
    title: "Build by moving, not guessing",
    description: "Place sections, text, media, and actions exactly where you want them with a canvas that stays out of your way.",
  },
  {
    icon: WandSparkles,
    eyebrow: "Customize",
    title: "Make every detail yours",
    description: "Tune spacing, typography, colors, and responsive behavior from one clear set of controls.",
  },
  {
    icon: Code2,
    eyebrow: "Ship",
    title: "Export clean, ready-to-use code",
    description: "Take your finished page with you as HTML, CSS, and JavaScript that is ready for your next launch.",
  },
]

const steps = [
  ["01", "Start with a blank canvas", "Choose a page structure that fits your idea."],
  ["02", "Shape the experience", "Add components and adjust the details visually."],
  ["03", "Share it with the world", "Export your page when it feels ready."],
]

const faqs = [
  ["Do I need to know how to code?", "No. LivePage is designed for visual building, so you can create and refine a page without writing code."],
  ["Can I export what I build?", "Yes. Export your page as a bundle of HTML, CSS, and JavaScript files so you can host it wherever you like."],
  ["Can I save my work and come back later?", "Yes. Save your project as a shortcode or file, then load it again whenever you are ready to continue."],
  ["What kind of pages can I make?", "Landing pages, personal sites, campaign pages, product launches, and any other focused web experience you can imagine."],
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="LivePage home">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Layers3 className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold tracking-tight">LivePage</span>
          </Link>
          <nav className="flex items-center gap-3" aria-label="Primary navigation">
            <Link href="#faq" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
              FAQ
            </Link>
            <Button asChild size="sm">
              <Link href="/try">Open builder</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border/70">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.16),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.12),transparent_32%)]" />
          <div className="mx-auto grid max-w-6xl gap-14 px-6 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-32">
            <div>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-medium">
                <Sparkles className="size-3.5" aria-hidden="true" />
                A calmer way to create
              </span>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.06em] md:text-7xl md:leading-[0.98]">
                Turn a blank canvas into a page people remember.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
                LivePage gives you the freedom of a design tool and the speed of a visual builder. Create something clear, useful, and ready to share.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full px-6">
                  <Link href="/try">
                    Start building <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                  <Link href="#how-it-works">See how it works</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {['No account required', 'Export anytime', 'Built for responsive pages'].map((item) => (
                  <span key={item} className="flex items-center gap-2"><Check className="size-4 text-primary" aria-hidden="true" />{item}</span>
                ))}
              </div>
            </div>
            <div className="relative rounded-[2rem] border border-foreground/10 bg-foreground p-3 shadow-2xl shadow-foreground/10">
              <div className="rounded-[1.5rem] bg-background p-5 sm:p-7">
                <div className="flex items-center justify-between border-b pb-5">
                  <div className="flex gap-1.5"><span className="size-2.5 rounded-full bg-muted-foreground/40" /><span className="size-2.5 rounded-full bg-muted-foreground/40" /><span className="size-2.5 rounded-full bg-muted-foreground/40" /></div>
                  <span className="text-xs font-medium text-muted-foreground">Untitled page</span>
                </div>
                <div className="flex flex-col gap-5 py-10">
                  <div className="h-3 w-20 rounded-full bg-primary/20" />
                  <div className="h-10 max-w-sm rounded-lg bg-foreground/90" />
                  <div className="h-3 max-w-xs rounded-full bg-muted" />
                  <div className="grid grid-cols-3 gap-3 pt-5"><div className="h-24 rounded-xl bg-muted" /><div className="h-24 rounded-xl bg-primary/10" /><div className="h-24 rounded-xl bg-muted" /></div>
                </div>
                <div className="flex items-center justify-between border-t pt-5 text-xs text-muted-foreground"><span>Canvas</span><span className="flex items-center gap-1.5"><Download className="size-3.5" aria-hidden="true" />Export</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">A focused toolkit</p><h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">Everything you need to move from idea to live page.</h2></div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">{features.map(({ icon: Icon, eyebrow, title, description }) => <article key={title} className="rounded-2xl border bg-card p-7"><Icon className="size-6 text-primary" aria-hidden="true" /><p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p><h3 className="mt-3 text-xl font-semibold tracking-tight">{title}</h3><p className="mt-3 leading-7 text-muted-foreground">{description}</p></article>)}</div>
        </section>

        <section id="how-it-works" className="border-y bg-muted/40">
          <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8"><div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">How it works</p><h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">Less setup. More making.</h2></div><div className="grid gap-8">{steps.map(([number, title, description]) => <div key={number} className="grid grid-cols-[3rem_1fr] gap-5 border-b pb-8 last:border-0 last:pb-0"><span className="text-sm font-semibold text-primary">{number}</span><div><h3 className="text-xl font-semibold">{title}</h3><p className="mt-2 text-muted-foreground">{description}</p></div></div>)}</div></div></div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-6 py-24 lg:px-8"><p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Questions, answered</p><h2 className="mt-4 text-center text-3xl font-semibold tracking-tight md:text-5xl">Frequently asked questions</h2><Accordion type="single" collapsible className="mt-12">{faqs.map(([question, answer], index) => <AccordionItem key={question} value={`item-${index}`}><AccordionTrigger className="text-left text-base md:text-lg">{question}</AccordionTrigger><AccordionContent className="text-base leading-7 text-muted-foreground">{answer}</AccordionContent></AccordionItem>)}</Accordion></section>

        <section className="mx-6 mb-24 rounded-[2rem] bg-primary px-6 py-16 text-center text-primary-foreground md:px-12 lg:mx-auto lg:max-w-6xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-70">Your next page starts here</p><h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">Make the first draft the easy part.</h2><p className="mx-auto mt-5 max-w-xl text-primary-foreground/75">Open the builder and see how quickly an idea can become something real.</p><Button asChild size="lg" variant="secondary" className="mt-8 rounded-full px-6"><Link href="/try">Open LivePage <ArrowRight data-icon="inline-end" /></Link></Button></section>
      </main>

      <footer className="border-t"><div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8"><div className="flex items-center gap-2 font-medium text-foreground"><Layers3 className="size-4" aria-hidden="true" />LivePage</div><p>© {new Date().getFullYear()} LivePage. Build something worth sharing.</p></div></footer>
    </div>
  )
}

