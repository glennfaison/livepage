import { act, cleanup, renderHook } from "@testing-library/react"
import { useAppState } from "@/client/features/app-state"

const PROMPT_ASSIST_ENABLED_KEY = "livepage-prompt-assist-enabled"

beforeEach(() => {
  cleanup()
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
})

describe("prompt assist enabled persistence", () => {
  it("writes livepage-prompt-assist-enabled when SET_PROMPT_ASSIST_ENABLED is dispatched", () => {
    const { result } = renderHook(() => useAppState())

    act(() => {
      result.current.dispatch({ type: "SET_PROMPT_ASSIST_ENABLED", payload: true })
    })

    expect(window.localStorage.getItem(PROMPT_ASSIST_ENABLED_KEY)).toBe("true")
    expect(result.current.state.promptAssistEnabled).toBe(true)
  })

  it("reads the persisted value on hydration", () => {
    window.localStorage.setItem(PROMPT_ASSIST_ENABLED_KEY, "true")

    const { result } = renderHook(() => useAppState())

    // Hydration happens in useEffect after mount
    expect(result.current.state.promptAssistEnabled).toBe(true)
  })
})
