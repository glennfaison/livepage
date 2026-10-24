import { act, renderHook } from "@testing-library/react"
import { DIVIDER_HIDE_DELAY_MS, useDividerVisibility } from "@/client/features/design-components/editor-controls/layout-divider"

const moveEvent = (x: number, y: number, width = 100, height = 100) =>
  ({
    clientX: x,
    clientY: y,
    currentTarget: {
      getBoundingClientRect: () => ({ left: 0, top: 0, width, height }),
    },
  }) as unknown as React.MouseEvent

const advance = (ms: number) => act(() => {
  jest.advanceTimersByTime(ms)
})

describe("useDividerVisibility", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("shows only the divider nearest the cursor and hides it after the delay when the cursor leaves that edge", () => {
    const { result } = renderHook(() => useDividerVisibility())

    act(() => {
      result.current.handleChildMouseMove(moveEvent(80, 50), 1)
    })

    // Child 1's end edge is insertion index 2.
    expect(Array.from(result.current.visibleVerticalDividers)).toEqual([2])
    expect(result.current.visibleHorizontalDividers.size).toBe(0)

    act(() => {
      result.current.handleChildMouseMove(moveEvent(50, 50), 1)
    })

    // Still visible until the hide delay elapses (pointer can reach the bar).
    expect(result.current.visibleVerticalDividers.has(2)).toBe(true)

    advance(DIVIDER_HIDE_DELAY_MS)
    expect(result.current.visibleVerticalDividers.size).toBe(0)
  })

  it("keeps a divider visible for the whole hide delay after the pointer moves away", () => {
    const { result } = renderHook(() => useDividerVisibility())

    act(() => {
      result.current.handleChildMouseMove(moveEvent(80, 50), 0)
    })
    act(() => {
      result.current.handleChildMouseLeave(0)
    })

    advance(DIVIDER_HIDE_DELAY_MS - 1)
    expect(result.current.visibleVerticalDividers.has(1)).toBe(true)

    advance(1)
    expect(result.current.visibleVerticalDividers.has(1)).toBe(false)
  })

  it("lingers longer than a quarter of a second", () => {
    expect(DIVIDER_HIDE_DELAY_MS).toBeGreaterThan(250)
  })

  it("does not push the hide deadline back when the pointer keeps moving away from the edge", () => {
    const { result } = renderHook(() => useDividerVisibility())

    act(() => {
      result.current.handleChildMouseMove(moveEvent(80, 50), 0)
    })
    act(() => {
      result.current.handleChildMouseMove(moveEvent(50, 50), 0)
    })

    advance(DIVIDER_HIDE_DELAY_MS / 2)
    act(() => {
      result.current.handleChildMouseMove(moveEvent(45, 50), 0)
    })
    advance(DIVIDER_HIDE_DELAY_MS / 2)

    expect(result.current.visibleVerticalDividers.has(1)).toBe(false)
  })

  it("hides every surrounding divider on leave after the delay, and a later show is not undone by a stale hide", () => {
    const { result } = renderHook(() => useDividerVisibility())

    act(() => {
      result.current.handleChildMouseMove(moveEvent(80, 10), 0)
    })
    expect(result.current.visibleVerticalDividers.has(1)).toBe(true)
    expect(result.current.visibleHorizontalDividers.has(0)).toBe(true)

    act(() => {
      result.current.handleChildMouseLeave(0)
    })
    // Delay: still visible so the pointer can land on the + button.
    expect(result.current.visibleVerticalDividers.has(1)).toBe(true)
    expect(result.current.visibleHorizontalDividers.has(0)).toBe(true)

    act(() => {
      result.current.handleChildMouseMove(moveEvent(10, 50), 1)
    })
    expect(result.current.visibleVerticalDividers.has(1)).toBe(true)

    act(() => {
      jest.runOnlyPendingTimers()
    })
    // Show after leave cancelled the pending hide for edge 1.
    expect(result.current.visibleVerticalDividers.has(1)).toBe(true)
  })

  describe("holdDivider", () => {
    it("shows the divider and keeps it through a child's leave and move events", () => {
      const { result } = renderHook(() => useDividerVisibility())

      act(() => {
        result.current.holdDivider("v", 1)
      })
      expect(result.current.visibleVerticalDividers.has(1)).toBe(true)

      act(() => {
        result.current.handleChildMouseLeave(0)
        result.current.handleChildMouseMove(moveEvent(50, 50), 0)
      })
      advance(DIVIDER_HIDE_DELAY_MS * 2)

      expect(result.current.visibleVerticalDividers.has(1)).toBe(true)
    })

    it("cancels a hide that was already pending when the hold starts", () => {
      const { result } = renderHook(() => useDividerVisibility())

      act(() => {
        result.current.handleChildMouseMove(moveEvent(80, 50), 0)
      })
      act(() => {
        result.current.handleChildMouseLeave(0)
      })
      advance(DIVIDER_HIDE_DELAY_MS - 10)
      act(() => {
        result.current.holdDivider("v", 1)
      })
      advance(DIVIDER_HIDE_DELAY_MS)

      expect(result.current.visibleVerticalDividers.has(1)).toBe(true)
    })

    it("hides the divider one full delay after the hold is released", () => {
      const { result } = renderHook(() => useDividerVisibility())

      let release = () => {}
      act(() => {
        release = result.current.holdDivider("v", 1)
      })
      act(() => {
        release()
      })

      advance(DIVIDER_HIDE_DELAY_MS - 1)
      expect(result.current.visibleVerticalDividers.has(1)).toBe(true)
      advance(1)
      expect(result.current.visibleVerticalDividers.has(1)).toBe(false)
    })

    it("stays visible until every holder of the same divider has released", () => {
      const { result } = renderHook(() => useDividerVisibility())

      let releaseA = () => {}
      let releaseB = () => {}
      act(() => {
        releaseA = result.current.holdDivider("v", 1)
        releaseB = result.current.holdDivider("v", 1)
      })
      act(() => {
        releaseA()
      })
      advance(DIVIDER_HIDE_DELAY_MS * 2)
      expect(result.current.visibleVerticalDividers.has(1)).toBe(true)

      act(() => {
        releaseB()
      })
      advance(DIVIDER_HIDE_DELAY_MS)
      expect(result.current.visibleVerticalDividers.has(1)).toBe(false)
    })

    it("tracks each axis independently", () => {
      const { result } = renderHook(() => useDividerVisibility())

      act(() => {
        result.current.holdDivider("h", 1)
      })
      act(() => {
        result.current.handleChildMouseLeave(0)
      })
      advance(DIVIDER_HIDE_DELAY_MS)

      expect(result.current.visibleHorizontalDividers.has(1)).toBe(true)
      expect(result.current.visibleVerticalDividers.has(1)).toBe(false)
    })
  })
})
