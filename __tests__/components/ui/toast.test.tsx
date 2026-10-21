import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ToastProvider } from "@/client/components/ui/toast"
import { Toaster } from "@/client/components/ui/toaster"
import { useToast } from "@/client/components/ui/use-toast"

function Harness() {
  const { toast } = useToast()
  return (
    <button
      onClick={() =>
        toast({ title: "Saved", description: "Your changes were saved." })
      }
    >
      Add toast
    </button>
  )
}

describe("Toast", () => {
  it("sets aria-live=polite on rendered toasts so screen readers announce updates", async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <Harness />
        <Toaster />
      </ToastProvider>,
    )

    await user.click(screen.getByRole("button", { name: "Add toast" }))

    const root = screen.getByText("Saved").closest("[aria-live]")
    expect(root).toBeInTheDocument()
    expect(root?.getAttribute("aria-live")).toBe("polite")
  })
})
