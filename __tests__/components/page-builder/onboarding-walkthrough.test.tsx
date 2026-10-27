import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { OnboardingWalkthrough } from "@/client/features/page-builder/onboarding-walkthrough"

const KEY = "livepage-onboarding-completed"

describe("OnboardingWalkthrough", () => {
  beforeEach(() => {
    localStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("does not show when already completed", () => {
    localStorage.setItem(KEY, "true")
    render(<OnboardingWalkthrough />)
    jest.advanceTimersByTime(2000)
    expect(screen.queryByText(/Add a component/)).toBeNull()
  })

  it("shows first step after delay on first visit and completes on Done", async () => {
    render(<OnboardingWalkthrough />)
    expect(screen.queryByText(/Add a component/)).toBeNull()
    jest.advanceTimersByTime(1300)
    await waitFor(() => {
      expect(screen.getByText("Add a component")).toBeInTheDocument()
    })
    // Advance through steps
    fireEvent.click(screen.getByRole("button", { name: "Got it" }))
    fireEvent.click(screen.getByRole("button", { name: "Got it" }))
    fireEvent.click(screen.getByRole("button", { name: "Got it" }))
    fireEvent.click(screen.getByRole("button", { name: "Done" }))
    expect(localStorage.getItem(KEY)).toBe("true")
  })
})
