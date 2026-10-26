import { describe, expect, it } from "@jest/globals"
import { generatedDataSettingsSchema, type GeneratedDataSettings, type GeneratedDataResult } from "@/client/features/data-sources/definitions/generated-data"

describe("generated data source types", () => {
	it("infers settings types from the zod schema", () => {
		const valid: GeneratedDataSettings = { generate: "return 1" }
		expect(valid.generate).toBe("return 1")

		const validArray: GeneratedDataSettings = { generate: ["return ", "1"] }
		expect(validArray.generate).toEqual(["return ", "1"])
	})

	it("validates settings at runtime through the schema", () => {
		expect(() => generatedDataSettingsSchema.parse({ generate: "return 1" })).not.toThrow()
		expect(() => generatedDataSettingsSchema.parse({ generate: ["return ", "1"] })).not.toThrow()
	})

	it("exposes a result type for the generated output", () => {
		const result: GeneratedDataResult = { foo: 1 }
		expect(result).toEqual({ foo: 1 })
	})

	it("rejects invalid settings shapes at the type level", () => {
		// @ts-expect-error - generate must be a string or array of strings, not a number
		const invalid: GeneratedDataSettings = { generate: 123 }
		expect(invalid.generate).toBe(123)
	})
})
