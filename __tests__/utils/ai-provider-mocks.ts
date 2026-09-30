// Shared jest doubles for the server-only lib/jev and lib/openai modules. A test file mocks a module with
//   jest.mock("@/lib/jev", () => jest.requireActual("../../utils/ai-provider-mocks").jevModuleMock)
// and drives the doubles through the exports below.
export const mockAskJev = jest.fn()
export const mockIsJevConfigured = jest.fn()
export const mockCompleteJson = jest.fn()
export const mockIsOpenAiConfigured = jest.fn()

class JevUnavailableError extends Error {}
class OpenAiUnavailableError extends Error {}

export const jevModuleMock = {
  askJev: (...args: unknown[]) => mockAskJev(...args),
  isJevConfigured: () => mockIsJevConfigured(),
  JevUnavailableError,
}
export const openAiModuleMock = {
  completeJson: (...args: unknown[]) => mockCompleteJson(...args),
  isOpenAiConfigured: () => mockIsOpenAiConfigured(),
  OpenAiUnavailableError,
}

/** Resets the doubles and makes both providers look configured. */
export function resetProviderMocks() {
  jest.resetAllMocks()
  mockIsJevConfigured.mockReturnValue(true)
  mockIsOpenAiConfigured.mockReturnValue(true)
}
