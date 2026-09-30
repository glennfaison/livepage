import type { PageRequest } from "./schema"

/** The person's request as plain text for a model: the prompt followed by each clarifying exchange. */
export function describeRequest(request: PageRequest): string {
  const exchanges = request.clarifications.map(({ question, answer }) => `Q: ${question}\nA: ${answer}`)
  return [request.prompt, ...exchanges].join("\n\n")
}
