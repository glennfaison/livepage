type Token =
	| { type: "text"; raw: string }
	| { type: "openTag"; raw: string; tag: string; isSelfClosing: boolean; attributes: Record<string, string> }
	| { type: "closeTag"; raw: string; tag: string; };

export type Node = string | {
	tag: string;
	attributes: Record<string, string>;
	children: Node[];
};

function tokenize(shortcode: string): Token[] {
	const tokens: Token[] = [];
	let i = 0;

	const _tagName = /[a-z-_][a-z0-9-_]*/i;
	const _attrValue = new RegExp(`"([^"]*)"|'([^']*)'|(\\d+)|(${_tagName.source})`, 'i');
	const RegEx = {
		whitespace: /\s/,
		openingTag: new RegExp(`^\\[(${_tagName.source})\\s*`, 'i'),
		attrNameValuePair: new RegExp(`^\\s*(${_tagName.source})\\s*(=\\s*(${_attrValue.source}))?`, 'i'),
		closingTag: new RegExp(`^\\[/(${_tagName.source})\\s*\\]`, 'i'),
		selfClosingBrace: /^\s*\/]/,
		closingBrace: /^\s*]/,
	};

	while (i < shortcode.length) {
		if (shortcode[i] !== "[") {
			const nextBracket = shortcode.indexOf("[", i);
			const endIndex = nextBracket === -1 ? shortcode.length : nextBracket;
			const text = shortcode.slice(i, endIndex);
			if (tokens[tokens.length - 1]?.type === "text") {
				tokens[tokens.length - 1].raw += text;
			} else {
				tokens.push({ type: "text", raw: text });
			}
			i += text.length;
			continue;
		}

		const rest = shortcode.slice(i);
		const closingTagMatch = rest.match(RegEx.closingTag);
		if (closingTagMatch) {
			const [raw, tag] = closingTagMatch;
			tokens.push({ type: "closeTag", tag, raw });
			i += raw.length;
			continue;
		}

		const openingTagMatch = rest.match(RegEx.openingTag);
		if (openingTagMatch) {
			const startOfTagIndex = i;
			const tag = openingTagMatch[1];
			i += openingTagMatch[0].length;
			const attributes: Record<string, string> = {};
			let isSelfClosing = false;

			let match: RegExpExecArray | null;
			RegEx.attrNameValuePair.lastIndex = 0;
			while ((match = RegEx.attrNameValuePair.exec(shortcode.slice(i)))) {
				const name = match[1];
				const value = match[5] ?? match[4] ?? match[3] ?? "";
				attributes[name] = value;
				i += match[0].length;
			}

			// Handle tag closing here
			if (match = RegEx.selfClosingBrace.exec(shortcode.slice(i))) {
				isSelfClosing = true;
			} else if (!(match = RegEx.closingBrace.exec(shortcode.slice(i)))) {
				const text = shortcode.slice(startOfTagIndex, i);
				if (tokens[tokens.length - 1]?.type === "text") {
					tokens[tokens.length - 1].raw += text;
				} else {
					tokens.push({ type: "text", raw: text });
				}
				continue;
			}

			i += match[0].length;
			const raw = shortcode.slice(startOfTagIndex, i);
			tokens.push({ type: "openTag", tag, isSelfClosing, raw, attributes });
			continue;
		}

		const text = "[";
		if (tokens[tokens.length - 1]?.type === "text") {
			tokens[tokens.length - 1].raw += text;
		} else {
			tokens.push({ type: "text", raw: text });
		}
		i++;
	}

	return tokens;
}

export function parse(input: string, acceptedTags?: string[]): Node[] {
	const tokens = tokenize(input);
	const output: Node[] = [];
	const stack: { node: Exclude<Node, string>; raw: string }[] = [];

	function appendOutput(target: Node[], node: Node) {
		if (typeof node === "string") {
			const text = node.trim();
			if (!text) return target;
			if (target[target.length - 1] && typeof target[target.length - 1] === "string") {
				target[target.length - 1] += text;
			} else {
				target.push(text);
			}
			return target;
		}
		target.push(node);
		return target;
	}

	for (const token of tokens) {
		switch (token.type) {
			case "text": {
				const target = stack.length ? stack[stack.length - 1].node.children : output;
				appendOutput(target, token.raw);
				break;
			}
			case "openTag": {
				const isAccepted = !acceptedTags || acceptedTags.includes(token.tag);
				if (!isAccepted) {
					const target = stack.length ? stack[stack.length - 1].node.children : output;
					appendOutput(target, token.raw);
					break;
				}
				const node = { tag: token.tag, attributes: token.attributes, children: [] } as Exclude<Node, string>;
				if (token.isSelfClosing) {
					const target = stack.length ? stack[stack.length - 1].node.children : output;
					target.push(node);
				} else {
					stack.push({ node, raw: token.raw });
				}
				break;
			}
			case "closeTag": {
				const idx = stack.findLastIndex((s) => s.node.tag === token.tag);

				if (idx === -1) {
					const target = stack.length ? stack[stack.length - 1].node.children : output;
					appendOutput(target, token.raw);
					break;
				}

				const unclosedTags = stack.splice(idx);
				const item = unclosedTags.shift()!;
				const unclosedTagsAsString = unclosedTags.map((tag) => tag.raw).join('');
				if (unclosedTagsAsString) {
					appendOutput(item.node.children, unclosedTagsAsString);
				}

				const targetAfterSplice = stack.length ? stack[stack.length - 1].node.children : output;
				targetAfterSplice.push(item.node);
				break;
			}
		}
	}

	while (stack.length) {
		const { node, raw } = stack.shift()!;
		appendOutput(output, raw);
		if (node.children.length) {
			output.push(...node.children);
		}
	}

	return output;
}

export function stringify(elements: Node[]): string {
	function serializeElement(element: Node): string {
		if (typeof element === 'string') {
			return element;
		}
		const attrs = Object.entries(element.attributes)
			.map(([key, value]) => value !== '' ? `${key}="${value}"` : key)
			.join(' ');
		const openTag = `[${element.tag}${attrs ? ' ' + attrs : ''}`;
		const children = ']' + element.children.map(serializeElement).join('');
		const closeTag = children.length ? `[/${element.tag}]` : '/]';
		return `${openTag}${children}${closeTag}`;
	}

	return elements.map(serializeElement).join('');
}
