"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, ChevronUp, CircleDot, Send, Sparkles, X } from "lucide-react"
import type { AppState, AppAction } from "@/features/types"
import { appReducer } from "@/features/app-state/commands/reducer"
import { createValidatedAiAction } from "./adapter"
import { sendLivePageAiMessage } from "./transport"
import { LIVE_PAGE_AI_MAX_PROGRESS_EVENTS, LIVE_PAGE_AI_MAX_TRANSCRIPT_MESSAGES, type LivePageAIMessage, type LivePageAIPlanStep, type LivePageAIProgressEvent } from "./contracts"

type Message = LivePageAIMessage
type WorkflowRequest = NonNullable<Parameters<typeof sendLivePageAiMessage>[0]["workflow"]>
type LivePageAIResult = Awaited<ReturnType<typeof sendLivePageAiMessage>>

// The chat transcript is reserved for things the user must actually read or answer —
// a clarifying question, or a plain reply outside the workflow protocol (e.g. "out of
// scope"). Routine build narration ("Next I'll add the header section…") only updates
// the activity log via `currentStep`/`progress`, so the conversation doesn't fill up
// with step-by-step chatter.
function isConversationalReply(response: LivePageAIResult): boolean {
  return !response.workflow || response.workflow.phase === "clarifying" || response.status === "out_of_scope"
}

export function LivePageAIChat({ state, dispatch, open, onOpenChange }: Readonly<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
  open: boolean
  onOpenChange: (open: boolean) => void
}>) {
  const [sessionId, setSessionId] = useState("")
  const [messages, setMessages] = useState<ReadonlyArray<Message>>([])
  const [prompt, setPrompt] = useState("")
  const [pending, setPending] = useState(false)
  const [progress, setProgress] = useState<ReadonlyArray<LivePageAIProgressEvent>>([])
  const [applyingMutation, setApplyingMutation] = useState<number | null>(null)
  const [completion, setCompletion] = useState("")
  const [minimized, setMinimized] = useState(false)
  const [workflow, setWorkflow] = useState<WorkflowRequest>({ phase: "start", confirmed: false, completedActionCount: 0 })
  const [understanding, setUnderstanding] = useState("")
  const [plan, setPlan] = useState<ReadonlyArray<LivePageAIPlanStep>>([])
  const [currentStep, setCurrentStep] = useState("")
  const [awaitingClarification, setAwaitingClarification] = useState(false)
  const workflowPromptRef = useRef("")
  const guidanceQueueRef = useRef<string[]>([])
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    const key = "livepage-ai-session-id"
    const existing = sessionStorage.getItem(key)
    const id = existing ?? crypto.randomUUID()
    if (!existing) sessionStorage.setItem(key, id)
    setSessionId(id)
  }, [])

  if (!open) return null

  const send = async (event: React.FormEvent, overrideText?: string, confirm = false) => {
    event.preventDefault()
    const text = (overrideText ?? prompt).trim()
    if (!text || !sessionId) return
    if (pending && !confirm) {
      // The AI is already mid-build; queue this as guidance instead of racing a second request.
      guidanceQueueRef.current.push(text)
      setPrompt("")
      setMessages((current) => [
        ...current,
        { role: "user" as const, content: text },
        { role: "assistant" as const, content: "Got it — I’ll factor that in before the next step." },
      ].slice(-LIVE_PAGE_AI_MAX_TRANSCRIPT_MESSAGES))
      return
    }
    if (pending) return
    setPrompt("")
    if (confirm) {
      // preserve the working brief already held in workflowPromptRef
    } else if (awaitingClarification) {
      workflowPromptRef.current = workflowPromptRef.current ? `${workflowPromptRef.current} ${text}` : text
      setAwaitingClarification(false)
    } else {
      workflowPromptRef.current = text
    }
    setProgress([])
    setCompletion("")
    setCurrentStep("")
    setApplyingMutation(null)
    if (confirm) setPlan([])
    const transcript = [...messages, { role: "user" as const, content: text }].slice(-LIVE_PAGE_AI_MAX_TRANSCRIPT_MESSAGES)
    setMessages(transcript)
    setPending(true)
    try {
      const requestHistoryIndex = stateRef.current.currentHistoryIndex
      const activity: LivePageAIProgressEvent[] = []
      const recordProgress = (events: ReadonlyArray<LivePageAIProgressEvent>) => {
        activity.push(...events)
        setProgress(activity.slice(-LIVE_PAGE_AI_MAX_PROGRESS_EVENTS))
      }
      let nextWorkflow: WorkflowRequest = { ...workflow, ...(confirm ? { phase: "understanding" as const, confirmed: true } : {}) }
      let response = await sendLivePageAiMessage({
          sessionId, message: workflowPromptRef.current || text, componentTree: stateRef.current.componentTree, historyIndex: requestHistoryIndex,
          transcript, workflow: nextWorkflow,
        })
      if (isConversationalReply(response)) {
        setMessages((current) => [...current, { role: "assistant" as const, content: response.message }].slice(-LIVE_PAGE_AI_MAX_TRANSCRIPT_MESSAGES))
      }
      setCurrentStep(response.workflow?.currentStep ?? "")
      if (response.workflow?.understanding) setUnderstanding(response.workflow.understanding)
      if (response.workflow?.plan) setPlan(response.workflow.plan)
      if (response.workflow?.phase === "clarifying") {
        setWorkflow({ phase: "start", confirmed: false, completedActionCount: 0 })
        setAwaitingClarification(true)
        setCompletion("")
        return
      }
      if (response.workflow?.phase === "confirmation") {
        setWorkflow({ ...nextWorkflow, phase: "understanding", confirmed: false })
        setCompletion("")
        return
      }

      let projectedState = stateRef.current
      // A typical plan has up to MAX_PLAN_STEPS components, and each one can cost up to two
      // loop iterations (the add/update itself, plus one bounded geometry-repair attempt — see
      // the diagnose-skill history for why repairs are capped at one per component). Size the
      // cap generously so a full plan can complete within a single confirmed turn instead of
      // stalling partway through and requiring the user to nudge it forward.
      const maxSteps = 24
      for (let step = 0; step < maxSteps; step += 1) {
        recordProgress(response.progress)
        const action = response.actions[0]
        if (action) {
          const validated = createValidatedAiAction(action, projectedState, projectedState.currentHistoryIndex)
          if (validated) {
            const nextState = appReducer(projectedState, validated)
            if (nextState !== projectedState) {
              setApplyingMutation(0)
              await new Promise((resolve) => setTimeout(resolve, 0))
              dispatch(validated)
              projectedState = nextState
              stateRef.current = nextState
              const componentId = nextState.selectedComponentId
              const element = typeof document !== "undefined" && componentId ? document.getElementById(componentId) : null
              nextWorkflow = {
                phase: "verify",
                confirmed: true,
                completedActionCount: nextWorkflow.completedActionCount + 1,
                lastAction: action,
                observation: {
                  componentId,
                  exists: Boolean(componentId && findNode(nextState.componentTree, componentId)),
                  rendered: Boolean(element),
                  validGeometry: Boolean(element && element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0),
                  issues: [],
                },
              }
              setWorkflow(nextWorkflow)
            }
          }
        }
        if (response.workflow?.phase === "complete" || !action) break
        await new Promise((resolve) => setTimeout(resolve, 0))
        if (guidanceQueueRef.current.length) {
          const guidance = guidanceQueueRef.current.splice(0).join(" ")
          workflowPromptRef.current = `${workflowPromptRef.current} ${guidance}`.trim()
        }
        response = await sendLivePageAiMessage({
          sessionId, message: workflowPromptRef.current || text, componentTree: projectedState.componentTree, historyIndex: projectedState.currentHistoryIndex,
          transcript, workflow: nextWorkflow,
        })
        if (isConversationalReply(response)) {
          setMessages((current) => [...current, { role: "assistant" as const, content: response.message }].slice(-LIVE_PAGE_AI_MAX_TRANSCRIPT_MESSAGES))
        }
        setCurrentStep(response.workflow?.currentStep ?? "")
      }
      setApplyingMutation(null)
      setWorkflow(nextWorkflow)
      setCompletion(response.workflow?.phase === "complete" ? "The page is complete. Job done." : response.message)
      if (response.workflow?.phase === "complete") {
        workflowPromptRef.current = ""
        setCurrentStep("")
      }
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant" as const, content: error instanceof Error ? error.message : "LivePageAI is unavailable." }].slice(-LIVE_PAGE_AI_MAX_TRANSCRIPT_MESSAGES))
    } finally {
      setPending(false)
    }

    function findNode(nodes: ReadonlyArray<import("@/features/types").AppNode>, id: string): import("@/features/types").AppNode | undefined {
      for (const node of nodes) {
        if (node.attributes.id === id) return node
        const nested = findNode(node.children.filter((child): child is import("@/features/types").AppNode => typeof child !== "string"), id)
        if (nested) return nested
      }
      return undefined
    }
  }

  return (
    <section
      className={cn(
        "fixed bottom-4 right-4 z-[60] flex w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl",
        minimized ? "h-12" : "min-h-[28rem] max-h-[calc(100vh-2rem)]",
      )}
      aria-label="LivePageAI chat"
    >
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles className="size-4 text-primary" />
          LivePageAI
          {pending && (
            <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground" role="status" aria-live="polite">
              <CircleDot className="size-3 animate-pulse text-primary" />
              Working…
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setMinimized((value) => !value)} aria-label={minimized ? "Expand LivePageAI" : "Minimize LivePageAI"}>
            {minimized ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Close LivePageAI"><X className="size-4" /></Button>
        </div>
      </header>
      {!minimized && <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 text-sm">
        {messages.length === 0 && <p className="text-muted-foreground">Ask for a focused page change. I’ll propose only supported, reviewable actions.</p>}
        {understanding && <p className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs">{understanding}</p>}
        {plan.length > 0 && workflow.phase === "understanding" && !workflow.confirmed && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs" aria-label="LivePageAI plan">
            <p className="mb-2 font-semibold text-muted-foreground">Here’s my plan:</p>
            <ol className="list-decimal space-y-1 pl-4">
              {plan.map((step, index) => (
                <li key={index}>
                  <strong>{step.componentTag}</strong> — {step.description} <span className="text-muted-foreground">({step.targetLocation})</span>
                </li>
              ))}
            </ol>
            <Button className="mt-3 w-full" onClick={(event) => void send(event, "Confirm this plan", true)}>Confirm plan</Button>
          </div>
        )}
        {plan.length === 0 && workflow.phase === "understanding" && !workflow.confirmed && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
            <Button className="w-full" onClick={(event) => void send(event, "Confirm this plan", true)}>Confirm and start building</Button>
          </div>
        )}
        {awaitingClarification && (
          <p className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-muted-foreground">
            Reply below with more detail so I can put together a build plan.
          </p>
        )}
        {messages.map((message, index) => <p key={index} className={cn("rounded-lg px-3 py-2", message.role === "user" ? "ml-8 bg-primary text-primary-foreground" : "mr-4 bg-muted")}>{message.content}</p>)}
        {(pending || progress.length > 0) && (
          <div className="mr-4 rounded-lg border bg-muted/50 p-3" aria-label="LivePageAI activity">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <CircleDot className={cn("size-3", pending && "animate-pulse text-primary")} /> Activity
            </div>
            <ol className="space-y-2">
              {progress.map((event, index) => (
                <li key={`${event.type}-${index}`} className="flex gap-2 text-xs">
                  <Check className={cn("mt-0.5 size-3 shrink-0", applyingMutation === index && "animate-pulse", "text-primary")} />
                  <span><strong>{event.intent}</strong><span className="block text-muted-foreground">Design component: {event.componentLabel ?? event.componentTag ?? "Not specified"} · Target: {event.targetLocation ?? "Current page"} · {event.status}</span></span>
                </li>
              ))}
              {applyingMutation !== null && <li className="text-xs font-medium text-primary">Applying the proposed mutation…</li>}
              {pending && <li className="flex gap-2 text-xs text-muted-foreground"><CircleDot className="mt-0.5 size-3 animate-pulse shrink-0" />Thinking through the next safe page action…</li>}
              {completion && <li className="flex gap-2 text-xs font-medium text-primary"><Check className="mt-0.5 size-3 shrink-0" />{completion}</li>}
            </ol>
          </div>
        )}
        {currentStep && <p className="text-[11px] italic text-muted-foreground/70" aria-live="polite">{currentStep}</p>}
      </div>}
      {!minimized && <form onSubmit={send} className="flex gap-2 border-t p-3">
        <Input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={pending ? "Add guidance while I work…" : "Ask LivePageAI…"}
          aria-label="Message LivePageAI"
        />
        <Button type="submit" size="icon" disabled={!prompt.trim()} aria-label="Send message"><Send className="size-4" /></Button>
      </form>}
    </section>
  )
}
