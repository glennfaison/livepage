import { act, renderHook } from "@testing-library/react"
import { useFieldDraft } from "@/client/features/page-builder/field-draft"

function setup(committedValue = "Test Value") {
  const onCommit = jest.fn()
  const utils = renderHook(() => useFieldDraft(committedValue, onCommit))
  return { onCommit, ...utils }
}

describe("useFieldDraft", () => {
  it("keeps the typed value local and does not commit per keystroke", () => {
    const { result, onCommit } = setup()

    act(() => {
      result.current.changeDraft("New")
    })
    expect(result.current.value).toBe("New")

    act(() => {
      result.current.changeDraft("New Value")
    })
    expect(result.current.value).toBe("New Value")
    expect(onCommit).not.toHaveBeenCalled()
  })

  it("typing N characters yields a single commit on blur", () => {
    const { result, onCommit } = setup()

    act(() => {
      result.current.changeDraft("hello world")
    })
    expect(onCommit).not.toHaveBeenCalled()

    act(() => {
      result.current.handleBlur()
    })

    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(onCommit).toHaveBeenCalledWith("hello world")
  })

  it("commits the trimmed value once, on Enter", () => {
    const { result, onCommit } = setup()
    const input = document.createElement("input")

    act(() => {
      result.current.changeDraft("  New Value  ")
    })
    act(() => {
      result.current.handleKeyDown({
        key: "Enter",
        preventDefault: jest.fn(),
        currentTarget: input,
      } as unknown as React.KeyboardEvent<HTMLInputElement>)
    })

    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(onCommit).toHaveBeenCalledWith("New Value")
    expect(result.current.value).toBe("Test Value")
  })

  it("commits the current value on blur", () => {
    const { result, onCommit } = setup()
    act(() => {
      result.current.changeDraft("Blurred Value")
    })
    act(() => {
      result.current.handleBlur()
    })

    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(onCommit).toHaveBeenCalledWith("Blurred Value")
  })

  it("reverts the draft on Escape without committing", () => {
    const { result, onCommit } = setup()
    const input = document.createElement("input")
    const blur = jest.spyOn(input, "blur")

    act(() => {
      result.current.changeDraft("Half typed")
    })
    act(() => {
      result.current.handleKeyDown({
        key: "Escape",
        preventDefault: jest.fn(),
        currentTarget: input,
      } as unknown as React.KeyboardEvent<HTMLInputElement>)
    })

    expect(onCommit).not.toHaveBeenCalled()
    expect(blur).toHaveBeenCalled()
    expect(result.current.value).toBe("Test Value")
  })

  it("drops an empty or whitespace-only draft instead of committing it", () => {
    const { result, onCommit } = setup()

    act(() => {
      result.current.commit("   ")
    })

    expect(onCommit).not.toHaveBeenCalled()
    expect(result.current.value).toBe("Test Value")
  })

  it("does not commit when the value is unchanged", () => {
    const { result, onCommit } = setup()

    act(() => {
      result.current.commit("Test Value")
    })

    expect(onCommit).not.toHaveBeenCalled()
  })

  it("commits once when Enter also triggers a blur commit for the same value", () => {
    const { result, onCommit } = setup()

    act(() => {
      result.current.changeDraft("New Value")
    })
    act(() => {
      result.current.handleKeyDown({
        key: "Enter",
        preventDefault: jest.fn(),
        currentTarget: { blur: jest.fn() } as unknown as HTMLInputElement,
      } as unknown as React.KeyboardEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleBlur()
    })

    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(onCommit).toHaveBeenCalledWith("New Value")
  })

  it("does not commit on Enter for multi-line fields", () => {
    const onCommit = jest.fn()
    const { result } = renderHook(() => useFieldDraft("multi", onCommit, { commitOnEnter: false }))
    const input = document.createElement("textarea")

    act(() => {
      result.current.changeDraft("line one\nline two")
    })
    act(() => {
      result.current.handleKeyDown({
        key: "Enter",
        preventDefault: jest.fn(),
        currentTarget: input,
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>)
    })

    expect(onCommit).not.toHaveBeenCalled()
    expect(result.current.value).toBe("line one\nline two")
  })
})
