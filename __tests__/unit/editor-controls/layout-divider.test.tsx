import { act, renderHook } from "@testing-library/react"
import { DIVIDER_HIDE_DELAY_MS, useDividerVisibility } from "@/client/features/design-components/editor-controls/layout-divider"
import type { DividerOrientation } from "@/client/features/design-components/editor-controls/layout-divider"

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

const setup = (orientation: DividerOrientation = "vertical") => renderHook(() => useDividerVisibility(orientation))

const indices = (map: ReadonlyMap<number, unknown>) => Array.from(map.keys())

describe("useDividerVisibility", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("shows only the divider nearest the cursor and hides it after the delay when the cursor leaves that edge", () => {
    const { result } = setup()

    act(() => {
      result.current.handleChildMouseMove(moveEvent(80, 50), 1)
    })

    // Child 1's end edge is insertion index 2.
    expect(indices(result.current.visibleDividers)).toEqual([2])

    act(() => {
      result.current.handleChildMouseMove(moveEvent(50, 50), 1)
    })

    // Still visible until the hide delay elapses (pointer can reach the bar).
    expect(result.current.visibleDividers.has(2)).toBe(true)

    advance(DIVIDER_HIDE_DELAY_MS)
    expect(result.current.visibleDividers.size).toBe(0)
  })

  it("keeps a divider visible for the whole hide delay after the pointer moves away", () => {
    const { result } = setup()

    act(() => {
      result.current.handleChildMouseMove(moveEvent(80, 50), 0)
    })
    act(() => {
      result.current.handleChildMouseLeave(0)
    })

    advance(DIVIDER_HIDE_DELAY_MS - 1)
    expect(result.current.visibleDividers.has(1)).toBe(true)

    advance(1)
    expect(result.current.visibleDividers.has(1)).toBe(false)
  })

  it("lingers longer than a quarter of a second", () => {
    expect(DIVIDER_HIDE_DELAY_MS).toBeGreaterThan(250)
  })

  it("does not push the hide deadline back when the pointer keeps moving away from the edge", () => {
    const { result } = setup()

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

    expect(result.current.visibleDividers.has(1)).toBe(false)
  })

  it("a later show is not undone by a stale hide", () => {
    const { result } = setup()

    act(() => {
      result.current.handleChildMouseMove(moveEvent(80, 10), 0)
    })
    act(() => {
      result.current.handleChildMouseLeave(0)
    })
    // Delay: still visible so the pointer can land on the + button.
    expect(result.current.visibleDividers.has(1)).toBe(true)

    act(() => {
      result.current.handleChildMouseMove(moveEvent(10, 50), 1)
    })
    act(() => {
      jest.runOnlyPendingTimers()
    })

    // The show after the leave cancelled the pending hide for insertion index 1.
    expect(result.current.visibleDividers.has(1)).toBe(true)
  })

  describe("orientation", () => {
    it("a vertical layout tracks the pointer's x position", () => {
      const { result } = setup("vertical")

      act(() => {
        result.current.handleChildMouseMove(moveEvent(10, 90), 0)
      })

      expect(indices(result.current.visibleDividers)).toEqual([0])
    })

    it("a horizontal layout tracks the pointer's y position", () => {
      const { result } = setup("horizontal")

      act(() => {
        result.current.handleChildMouseMove(moveEvent(10, 90), 0)
      })

      expect(indices(result.current.visibleDividers)).toEqual([1])
    })
  })

  describe("anchors", () => {
    it("anchors a divider to the child edge the pointer is near", () => {
      const { result } = setup()

      act(() => {
        result.current.handleChildMouseMove(moveEvent(10, 50), 3)
      })
      expect(result.current.visibleDividers.get(3)).toEqual({ childIndex: 3, edge: "start" })

      act(() => {
        result.current.handleChildMouseMove(moveEvent(90, 50), 3)
      })
      expect(result.current.visibleDividers.get(4)).toEqual({ childIndex: 3, edge: "end" })
    })

    it("shows one divider per insertion point when neighbours share it, anchored where the pointer last was", () => {
      const { result } = setup()

      // Near the end of child 1: insertion index 2.
      act(() => {
        result.current.handleChildMouseMove(moveEvent(90, 50), 1)
      })
      expect(result.current.visibleDividers.get(2)).toEqual({ childIndex: 1, edge: "end" })

      // Then near the start of child 2: the same insertion index.
      act(() => {
        result.current.handleChildMouseMove(moveEvent(10, 50), 2)
      })

      expect(indices(result.current.visibleDividers)).toEqual([2])
      expect(result.current.visibleDividers.get(2)).toEqual({ childIndex: 2, edge: "start" })
    })
  })

  describe("holdDivider", () => {
    const show = (result: { current: ReturnType<typeof useDividerVisibility> }, childIndex = 0) => {
      act(() => {
        result.current.handleChildMouseMove(moveEvent(80, 50), childIndex)
      })
    }

    it("keeps the divider through a child's leave and move events", () => {
      const { result } = setup()
      show(result)

      act(() => {
        result.current.holdDivider(1)
      })
      act(() => {
        result.current.handleChildMouseLeave(0)
        result.current.handleChildMouseMove(moveEvent(50, 50), 0)
      })
      advance(DIVIDER_HIDE_DELAY_MS * 2)

      expect(result.current.visibleDividers.has(1)).toBe(true)
    })

    it("cancels a hide that was already pending when the hold starts", () => {
      const { result } = setup()
      show(result)

      act(() => {
        result.current.handleChildMouseLeave(0)
      })
      advance(DIVIDER_HIDE_DELAY_MS - 10)
      act(() => {
        result.current.holdDivider(1)
      })
      advance(DIVIDER_HIDE_DELAY_MS)

      expect(result.current.visibleDividers.has(1)).toBe(true)
    })

    it("keeps its anchor while held, so the bar cannot jump away from an open popover", () => {
      const { result } = setup()
      show(result, 0) // insertion 1 anchored to child 0's end

      act(() => {
        result.current.holdDivider(1)
      })
      // The pointer wanders to the start of child 1, which would claim insertion 1 for itself.
      act(() => {
        result.current.handleChildMouseMove(moveEvent(10, 50), 1)
      })

      expect(result.current.visibleDividers.get(1)).toEqual({ childIndex: 0, edge: "end" })
    })

    it("takes the new anchor again once released", () => {
      const { result } = setup()
      show(result, 0)

      let release = () => {}
      act(() => {
        release = result.current.holdDivider(1)
      })
      act(() => {
        release()
      })
      act(() => {
        result.current.handleChildMouseMove(moveEvent(10, 50), 1)
      })

      expect(result.current.visibleDividers.get(1)).toEqual({ childIndex: 1, edge: "start" })
    })

    it("hides the divider one full delay after the hold is released", () => {
      const { result } = setup()
      show(result)

      let release = () => {}
      act(() => {
        release = result.current.holdDivider(1)
      })
      act(() => {
        release()
      })

      advance(DIVIDER_HIDE_DELAY_MS - 1)
      expect(result.current.visibleDividers.has(1)).toBe(true)
      advance(1)
      expect(result.current.visibleDividers.has(1)).toBe(false)
    })

    it("stays visible until every holder of the same divider has released", () => {
      const { result } = setup()
      show(result)

      let releaseA = () => {}
      let releaseB = () => {}
      act(() => {
        releaseA = result.current.holdDivider(1)
        releaseB = result.current.holdDivider(1)
      })
      act(() => {
        releaseA()
      })
      advance(DIVIDER_HIDE_DELAY_MS * 2)
      expect(result.current.visibleDividers.has(1)).toBe(true)

      act(() => {
        releaseB()
      })
      advance(DIVIDER_HIDE_DELAY_MS)
      expect(result.current.visibleDividers.has(1)).toBe(false)
    })

    it("does not invent a divider that was never shown", () => {
      const { result } = setup()

      act(() => {
        result.current.holdDivider(5)
      })

      expect(result.current.visibleDividers.size).toBe(0)
    })
  })
})
