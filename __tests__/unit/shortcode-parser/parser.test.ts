import { parse, stringify } from "../../../lib/shortcode-parser/parser";
import { shortcodeSamples, parsedShortcodeElementSamples } from "./samples";

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