import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Layers, Download, Code } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b px-2">
        <div className="container flex items-center justify-between py-4 mx-auto">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">LivePage</h1>
          </div>
          <nav>
            <Link href="/try">
              <Button>Try Builder</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Build Beautiful Web Pages <span className="text-primary">Without Code</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create, customize, and export web pages with our intuitive drag-and-drop builder. No coding skills
              required.
            </p>
            <Link href="/try">
              <Button size="lg" className="gap-2">
                Start Building <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16 bg-muted/50">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Layers className="h-10 w-10 text-primary" />}
                title="Drag & Drop Builder"
                description="Easily build pages by dragging and dropping components exactly where you want them."
              />
              <FeatureCard
                icon={<Download className="h-10 w-10 text-primary" />}
                title="Save & Load Projects"
                description="Save your work as a shortcode or file and load it later to continue where you left off."
              />
              <FeatureCard
                icon={<Code className="h-10 w-10 text-primary" />}
                title="Export as HTML/CSS/JS"
                description="Export your creation as bundled HTML, CSS, and JavaScript files ready for deployment."
              />
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Create?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Jump into our builder and start creating your web page in minutes.
            </p>
            <Link href="/try">
              <Button size="lg" variant="default">
                Try the Builder
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} LivePage. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
