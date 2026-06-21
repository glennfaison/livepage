import { parse, stringify } from "@/features/shortcode-parser/parser";
import { shortcodeSamples, parsedShortcodeElementSamples } from "./data";

describe("parse", () => {
	shortcodeSamples.forEach((sample, idx) => {

		test(`parses shortcodeSamples[${idx}]: ${sample.shortcode}`, () => {
			idx = Number(idx);
			const result = parse(sample.shortcode, sample.acceptedTags);
			expect(result).toEqual(sample.parsedResult);
		});
	});
});

describe("stringify", () => {
	parsedShortcodeElementSamples.forEach((sample, idx) => {

		test(`stringifies parsedShortcodeElementSamples[${idx}]: ${JSON.stringify(sample.parsedElements)}`, () => {
			idx = Number(idx);
			const result = stringify(sample.parsedElements);
			expect(result).toEqual(sample.stringifiedResult);
		});
	});
});