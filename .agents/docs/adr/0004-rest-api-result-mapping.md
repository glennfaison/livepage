# REST API result mapping

**Status:** Rejected

## Context

The REST API data source accepts a JavaScript function body that maps the
response to values consumed by the page. Replacing it with JSONPath removes
arbitrary mapping capabilities that existing page configurations may rely on.

The function currently runs in the browser's realm. Wrapping it in a function
or changing its lexical scope does not isolate it from that realm's globals:
user code can still access `globalThis` and browser APIs. The JSONPath change
therefore avoids code execution by removing the mapping language; it does not
provide an equivalent sandbox for arbitrary JavaScript.

## Decision

Reject the JSONPath replacement and preserve the existing JavaScript mapping
interface. Do not treat this decision as a security fix: imported or otherwise
untrusted page configurations containing mapping code can execute in the
browser context.

Any future security remediation must either make the compatibility tradeoff of
removing arbitrary JavaScript explicit, or provide an isolated execution
environment that preserves the mapping capability. Lexical-scope changes to
`new Function` are not sufficient isolation.

## Consequences

- Existing REST API result mappings retain their full JavaScript flexibility.
- The arbitrary-code-execution risk remains and must be addressed separately;
  this decision does not close issue #152.
