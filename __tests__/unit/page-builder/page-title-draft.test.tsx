import { act, renderHook } from "@testing-library/react"
import { usePageTitleDraft } from "@/client/features/page-builder/page-title-draft"

function setup(committedTitle = "Test Page") {
  const onCommit = jest.fn()
  const utils = renderHook(() => usePageTitleDraft(committedTitle, onCommit))
  return { onCommit, ...utils }
}

describe("usePageTitleDraft", () => {
  it("keeps the typed value local and does not commit per keystroke", () => {
    const { result, onCommit } = setup()

    act(() => {
      result.current.changeDraft("New")
    })
    expect(result.current.value).toBe("New")

    act(() => {
      result.current.changeDraft("New Title")
    })
    expect(result.current.value).toBe("New Title")
    expect(onCommit).not.toHaveBeenCalled()
  })

  it("commits the trimmed title once, on Enter", () => {
    const { result, onCommit } = setup()
    const input = document.createElement("input")

    act(() => {
      result.current.changeDraft("  New Title  ")
    })
    act(() => {
      result.current.handleKeyDown({
        key: "Enter",
        preventDefault: jest.fn(),
        currentTarget: input,
      } as unknown as React.KeyboardEvent<HTMLInputElement>)
    })

    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(onCommit).toHaveBeenCalledWith("New Title")
    // The draft falls back to the committed prop again; the typed value only
    // stays put until the page prop catches up with the commit.
    expect(result.current.value).toBe("Test Page")
  })

  it("commits the current value on blur", () => {
    const { result, onCommit } = setup()
    act(() => {
      result.current.changeDraft("Blurred Title")
    })
    act(() => {
      result.current.handleBlur()
    })

    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(onCommit).toHaveBeenCalledWith("Blurred Title")
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
    expect(result.current.value).toBe("Test Page")
  })

  it("drops an empty or whitespace-only draft instead of committing it", () => {
    const { result, onCommit } = setup()

    act(() => {
      result.current.commit("   ")
    })

    expect(onCommit).not.toHaveBeenCalled()
    expect(result.current.value).toBe("Test Page")
  })

  it("does not commit when the title is unchanged", () => {
    const { result, onCommit } = setup()

    act(() => {
      result.current.commit("Test Page")
    })

    expect(onCommit).not.toHaveBeenCalled()
  })

  it("commits once when Enter also triggers a blur commit for the same value", () => {
    const { result, onCommit } = setup()

    act(() => {
      result.current.changeDraft("New Title")
    })
    act(() => {
      result.current.handleKeyDown({
        key: "Enter",
        preventDefault: jest.fn(),
        currentTarget: { blur: jest.fn() } as unknown as HTMLInputElement,
      } as unknown as React.KeyboardEvent<HTMLInputElement>)
    })
    // The blur handler is re-created on the next render, but an input blur can
    // also fire with the pre-commit closure; that repeat must not re-commit.
    act(() => {
      result.current.handleBlur()
    })

    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(onCommit).toHaveBeenCalledWith("New Title")
  })
})
