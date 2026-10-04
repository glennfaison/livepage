import { act, renderHook } from "@testing-library/react"
import { useDividerVisibility } from "@/client/features/design-components/editor-controls/layout-divider"

const moveEvent = (x: number, y: number, width = 100, height = 100) =>
  ({
    clientX: x,
    clientY: y,
    currentTarget: {
      getBoundingClientRect: () => ({ left: 0, top: 0, width, height }),
    },
  }) as unknown as React.MouseEvent

describe("useDividerVisibility", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("shows only the divider nearest the cursor and hides it after a short delay when the cursor leaves that edge", () => {
    const { result } = renderHook(() => useDividerVisibility())

    act(() => {
      result.current.handleChildMouseMove(moveEvent(80, 50), 1)
    })

    expect(Array.from(result.current.visibleVerticalDividers)).toEqual([4])
    expect(result.current.visibleHorizontalDividers.size).toBe(0)

    act(() => {
      result.current.handleChildMouseMove(moveEvent(50, 50), 1)
    })

    // Still visible until the hide delay elapses (pointer can reach the bar).
    expect(result.current.visibleVerticalDividers.has(4)).toBe(true)

    act(() => {
      jest.advanceTimersByTime(250)
    })
    expect(result.current.visibleVerticalDividers.size).toBe(0)
  })

  it("hides every surrounding divider on leave after the delay, and a later show is not undone by a stale hide", () => {
    const { result } = renderHook(() => useDividerVisibility())

    act(() => {
      result.current.handleChildMouseMove(moveEvent(80, 10), 0)
    })
    expect(result.current.visibleVerticalDividers.has(2)).toBe(true)
    expect(result.current.visibleHorizontalDividers.has(0)).toBe(true)

    act(() => {
      result.current.handleChildMouseLeave(0)
    })
    // Delay: still visible so the pointer can land on the + button.
    expect(result.current.visibleVerticalDividers.has(2)).toBe(true)
    expect(result.current.visibleHorizontalDividers.has(0)).toBe(true)

    act(() => {
      result.current.handleChildMouseMove(moveEvent(10, 50), 1)
    })
    expect(result.current.visibleVerticalDividers.has(2)).toBe(true)

    act(() => {
      jest.runOnlyPendingTimers()
    })
    // Show after leave cancelled the pending hide for edge 2.
    expect(result.current.visibleVerticalDividers.has(2)).toBe(true)
  })
})
