import "@testing-library/jest-dom"
import { renderHook, act } from "@testing-library/react"
import { getLayoutRect, readElementBox, useElementBox } from "@/client/features/design-components/editor-controls/shared/use-element-box"

const rect = (top: number, left: number, width: number, height: number) =>
  ({ top, left, width, height, x: left, y: top, right: left + width, bottom: top + height, toJSON: () => ({}) }) as DOMRect

describe("readElementBox", () => {
  afterEach(() => jest.restoreAllMocks())

  it("returns null when there is no element or it has no box", () => {
    expect(readElementBox(null)).toBeNull()
    expect(readElementBox(document.createElement("div"))).toBeNull()
  })

  it("converts the viewport rect to document coordinates and reads the border radius", () => {
    Object.defineProperty(window, "scrollY", { value: 200, configurable: true })
    Object.defineProperty(window, "scrollX", { value: 7, configurable: true })
    const el = document.createElement("div")
    el.style.borderRadius = "12px"
    jest.spyOn(el, "getBoundingClientRect").mockReturnValue(rect(10, 20, 300, 50))
    expect(readElementBox(el)).toEqual({ top: 210, left: 27, width: 300, height: 50, radius: "12px" })
  })
})

describe("getLayoutRect", () => {
  afterEach(() => jest.restoreAllMocks())

  it("measures the first child of a display: contents element, whose own rectangle is empty", () => {
    const wrapper = document.createElement("div")
    wrapper.style.display = "contents"
    const child = document.createElement("span")
    wrapper.appendChild(child)
    jest.spyOn(wrapper, "getBoundingClientRect").mockReturnValue(rect(0, 0, 0, 0))
    jest.spyOn(child, "getBoundingClientRect").mockReturnValue(rect(5, 6, 70, 80))
    expect(getLayoutRect(wrapper).width).toBe(70)
    expect(getLayoutRect(wrapper).height).toBe(80)
  })

  it("measures an ordinary element itself", () => {
    const el = document.createElement("div")
    jest.spyOn(el, "getBoundingClientRect").mockReturnValue(rect(0, 0, 40, 30))
    expect(getLayoutRect(el).width).toBe(40)
  })

  it("accepts a plain object that only has getBoundingClientRect", () => {
    const fake = { getBoundingClientRect: () => rect(0, 0, 11, 22) } as unknown as Element
    expect(getLayoutRect(fake).height).toBe(22)
  })
})

describe("useElementBox", () => {
  afterEach(() => jest.restoreAllMocks())

  it("tracks the element only while active and follows layout changes between frames", () => {
    jest.useFakeTimers()
    const frames: FrameRequestCallback[] = []
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => (frames.push(cb), frames.length))
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {})
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true })
    Object.defineProperty(window, "scrollX", { value: 0, configurable: true })

    const el = document.createElement("div")
    const spy = jest.spyOn(el, "getBoundingClientRect").mockReturnValue(rect(0, 0, 100, 20))
    const getElement = () => el

    const { result, rerender } = renderHook(({ active }) => useElementBox(getElement, active), { initialProps: { active: false } })
    expect(result.current).toBeNull()
    expect(spy).not.toHaveBeenCalled()

    rerender({ active: true })
    expect(result.current?.width).toBe(100)

    spy.mockReturnValue(rect(0, 0, 250, 20))
    act(() => { frames.shift()?.(0) })
    expect(result.current?.width).toBe(250)

    rerender({ active: false })
    expect(result.current).toBeNull()
    jest.useRealTimers()
  })
})
