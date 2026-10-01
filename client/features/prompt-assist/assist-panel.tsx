import { Send, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { cn } from "@/client/lib/utils"
import type { AssistStatus } from "./chat-state"
import { ProposalCard, StatusLine } from "./proposal-card"
import type { PromptAssist } from "./use-prompt-assist"

const STATUS_TEXT: Readonly<Record<AssistStatus["phase"], (status: AssistStatus) => string>> = {
  idle: () => "",
  matching: () => "Finding the closest template…",
  drafting: () => "Drafting copy…",
  refining: (status) => `Adjusting the design (step ${status.phase === "refining" ? status.step : 1})…`,
}

// A keyed sentinel at the end of the log: remounting it on each new entry scrolls the log without an effect.
const scrollIntoViewOnMount = (node: HTMLElement | null) => node?.scrollIntoView?.({ block: "end" })

function Composer(props: Readonly<{ disabled: boolean; onSend: (text: string) => void }>) {
  const [text, setText] = useState("")
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        props.onSend(text)
        setText("")
      }}
      className="flex items-center gap-2 border-t p-2"
    >
      <Input value={text} onChange={(event) => setText(event.target.value)} placeholder="Describe the page you want…" disabled={props.disabled} />
      <Button type="submit" size="icon" disabled={props.disabled || !text.trim()} aria-label="Send">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}

export function AssistPanel(props: Readonly<{ chat: PromptAssist; onClose: () => void }>) {
  const { chat, onClose } = props
  const logLength = chat.messages.length + (chat.proposal ? 1 : 0) + (chat.busy ? 1 : 0)

  return (
    <div className="fixed bottom-4 right-4 z-40 flex h-[32rem] w-80 flex-col overflow-hidden rounded-lg border bg-background shadow-xl">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">Page assistant</span>
        <button type="button" onClick={onClose} aria-label="Minimize page assistant" className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto p-3">
        {chat.messages.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Describe the page you want, in your own words, and I&apos;ll pick a template, draft its text, and tune its design to fit.
          </p>
        )}

        {chat.messages.map((message) => {
          if (message.kind === "clarify") {
            return (
              <div key={message.id} className="max-w-[90%] space-y-2 rounded-lg bg-muted px-3 py-2 text-sm">
                <p>{message.question}</p>
                {message.options.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {message.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        disabled={chat.busy}
                        onClick={() => chat.send(option)}
                        className="rounded-full border bg-background px-2 py-0.5 text-xs hover:bg-accent hover:text-accent-foreground"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          }
          return (
            <div
              key={message.id}
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                message.kind === "error" ? "bg-destructive/10 text-destructive" : message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              {message.text}
            </div>
          )
        })}

        {chat.needsManualPick && !chat.proposal && !chat.busy && (
          <div className="flex flex-wrap gap-1" role="group" aria-label="Choose a template">
            {chat.catalog.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => chat.pickTemplate(entry.id)}
                className="rounded-full border bg-background px-2 py-0.5 text-xs hover:bg-accent hover:text-accent-foreground"
              >
                {entry.name}
              </button>
            ))}
          </div>
        )}
        {chat.busy && <StatusLine text={STATUS_TEXT[chat.status.phase](chat.status)} />}
        {chat.proposal && !chat.busy && (
          <ProposalCard proposal={chat.proposal} catalog={chat.catalog} onPickTemplate={chat.pickTemplate} onEditCopy={chat.editCopy} onApply={chat.apply} />
        )}
        <div key={logLength} ref={scrollIntoViewOnMount} />
      </div>

      <Composer disabled={chat.busy} onSend={chat.send} />
    </div>
  )
}
