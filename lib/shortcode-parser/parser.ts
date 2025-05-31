type ShortcodeElement = {
	tag: string;
	attributes: Record<string, string>;
	children: (string | ShortcodeElement)[];
};

const EventNames = {
	FoundNewShortcode: 'new-shortcode',
	FoundOpeningTagPrefix: 'opening-tag-prefix',
	FoundOpeningTagSuffix: 'opening-tag-suffix',
	FoundTagName: 'tag-name',
	FoundClosingTagPrefix: 'closing-tag-prefix',
	FoundEndOfElement: 'end-of-element',
} as const;

type AllEventNames = typeof EventNames[keyof typeof EventNames];
type ToExclude = typeof EventNames.FoundOpeningTagSuffix | typeof EventNames.FoundEndOfElement;

type ParserEvent =
	| {
		status: typeof EventNames.FoundOpeningTagSuffix;
		index: number;
		element: ShortcodeElement;
	}
	| {
		status: typeof EventNames.FoundEndOfElement;
		index: number;
		openerSuffixEvent: ParserEvent | null;
	}
	| {
		status: Exclude<AllEventNames, ToExclude>;
		index: number;
	};

function isOpenerSuffixEvent(event: ParserEvent): event is Extract<ParserEvent, { status: typeof EventNames.FoundOpeningTagSuffix }> {
	return event.status === EventNames.FoundOpeningTagSuffix;
}

function isEndOfElementEvent(event: ParserEvent): event is Extract<ParserEvent, { status: typeof EventNames.FoundEndOfElement }> {
	return event.status === EventNames.FoundEndOfElement;
}

export function parse(shortcode: string, acceptedTags?: string[]): (string | ShortcodeElement)[] {
	const _tagName = /[a-z-_][a-z0-9-_]*/i;
	const _attrValue = new RegExp(`"([^"]*)"|'([^']*)'|(\\d+)|(${_tagName.source})`, 'i');
	const RegExps: Record<string, RegExp> = {
		whitespace: /\s/i,
		openingTag: new RegExp(`^\\[(${_tagName.source})\\s*`, 'i'),
		attrNameValuePair: new RegExp(`^\\s*(${_tagName.source})\\s*(=\\s*(${_attrValue.source}))?`, 'i'),
		closingTag: new RegExp(`^\\[/${_tagName.source}\\s*\\]`, 'i'),
	};

	const events: ParserEvent[] = [{ status: EventNames.FoundNewShortcode, index: 0 }];
	const returnValue: (string | ShortcodeElement)[] = [];
	let currentElement: ShortcodeElement = {
		tag: '',
		attributes: {},
		children: [],
	};

	let i = 0;
	do {
		if (i === shortcode.length) {
			events.length = 1;
		}
		const mostRecentEventName: ParserEvent['status'] = events[events.length - 1].status;
		switch (mostRecentEventName) {
			case EventNames.FoundNewShortcode: {
				const lastOpeningTagSuffixAction = events.findLast(isOpenerSuffixEvent);
				const currentOutput = lastOpeningTagSuffixAction ? lastOpeningTagSuffixAction.element.children : returnValue;
				if (shortcode[i] === '[' && shortcode[i + 1] === '/') {
					events.push({ status: EventNames.FoundClosingTagPrefix, index: i });
				} else if (shortcode[i] === '[') {
					events.push({ status: EventNames.FoundOpeningTagPrefix, index: i });
				} else if (i === shortcode.length) {
					i++;
				} else {
					i++;
					continue;
				}

				const lastStartIndex = events.findLast(({ status }) => status === EventNames.FoundNewShortcode)!.index;
				const stringToOutput = shortcode.substring(lastStartIndex, i).trim();
				i--;
				if (typeof currentOutput[currentOutput.length - 1] === 'string') {
					currentOutput[currentOutput.length - 1] += stringToOutput;
				} else if (stringToOutput) {
					currentOutput.push(stringToOutput);
				}
				break;
			}
			case EventNames.FoundOpeningTagPrefix: {
				const openingTagMatches = shortcode.substring(i).match(RegExps.openingTag);
				if (openingTagMatches && (!acceptedTags || acceptedTags?.includes(openingTagMatches[1]))) {
					const tagName = openingTagMatches[1];
					currentElement = { tag: tagName, attributes: {}, children: [] };
					i += openingTagMatches[0].length - 1;
					events.push({ status: EventNames.FoundTagName, index: i });
				} else {
					const lastOpeningTagIndex = events.findLastIndex(({ status }) => status === EventNames.FoundOpeningTagPrefix);
					events.length = lastOpeningTagIndex;
					events[events.length - 1].index = i;
				}
				break;
			}
			case EventNames.FoundTagName: {
				if (shortcode[i] === '/' && shortcode[i + 1] === ']') {
					events.push({ status: EventNames.FoundEndOfElement, index: i + 1, openerSuffixEvent: null });
				} else if (shortcode[i] === ']') {
					events.push({ status: EventNames.FoundOpeningTagSuffix, index: i, element: currentElement });
				} else if (RegExps.attrNameValuePair.test(shortcode.substring(i))) {
					const pairMatches = shortcode.substring(i).match(RegExps.attrNameValuePair)!;
					const attrName = pairMatches[1];
					const attrValue = pairMatches[5] || pairMatches[4] || pairMatches[3] || '';
					currentElement.attributes[attrName] = attrValue;
					i += pairMatches[0].length - 1;
				} else if (RegExps.whitespace.test(shortcode[i])) {
					// Do nothing, just skip whitespace
				} else {
					const lastOpenerPrefixIndex = events.findLast(({ status }) => status === EventNames.FoundOpeningTagPrefix)!.index;
					const lastNewShortcodeEventIndex = events.findLastIndex(({ status }) => status === EventNames.FoundNewShortcode);
					events.length = lastNewShortcodeEventIndex + 1;
					events[events.length - 1].index = lastOpenerPrefixIndex;
					i--;
				}
				break;
			}
			case EventNames.FoundOpeningTagSuffix: {
				if (RegExps.whitespace.test(shortcode[i])) {
					// Do nothing, just skip whitespace
				} else if (RegExps.closingTag.test(shortcode.substring(i))) {
					events.push({ status: EventNames.FoundClosingTagPrefix, index: i });
					i--;
				} else {
					events.push({ status: EventNames.FoundNewShortcode, index: i });
					i--;
				}
				break;
			}
			case EventNames.FoundClosingTagPrefix: {
				const openerSuffixEvents = events.filter(isOpenerSuffixEvent);
				let foundMatchingOpeningTag = false;
				for (const event of openerSuffixEvents) {
					const { element } = event;
					const closingTagRegExp = new RegExp(`^\\[/${element!.tag}\\s*\\]`, 'i');
					const matches = shortcode.substring(i).match(closingTagRegExp);
					if (matches) {
						if (openerSuffixEvents[openerSuffixEvents.length - 1] !== event) {
							const openerSuffixEventIndex = events.indexOf(event);
							events.length = openerSuffixEventIndex + 1;
							events.push({ status: EventNames.FoundNewShortcode, index: event.index + 1 });
							currentElement = event.element;
						} else {
							i += matches[0].length - 1;
							events.push({ status: EventNames.FoundEndOfElement, index: i, openerSuffixEvent: event });
						}
						i--;
						foundMatchingOpeningTag = true;
						break;
					}
				}
				if (!foundMatchingOpeningTag) {
					events.pop();
					if (events[events.length - 1].status === EventNames.FoundOpeningTagSuffix) {
						events.push({ status: EventNames.FoundNewShortcode, index: i });
					} else {
						events[events.length - 1].index = i;
					}
				}
				break;
			}
			case EventNames.FoundEndOfElement: {
				let outputArray = returnValue;
				let historyCutoffIndex = events.length - 1;
				const { openerSuffixEvent } = events.findLast(isEndOfElementEvent)!;

				const openerSuffixEvents = events.filter(isOpenerSuffixEvent);
				const parentOpenerSuffixEvent = openerSuffixEvent ? openerSuffixEvents[openerSuffixEvents.length - 2] : openerSuffixEvents[openerSuffixEvents.length - 1];
				if (!!parentOpenerSuffixEvent) {
					historyCutoffIndex = events.lastIndexOf(parentOpenerSuffixEvent);
					outputArray = parentOpenerSuffixEvent.element.children;
				} else {
					const elementOpenerPrefixEvent = events.findLastIndex(({ status }) => status === EventNames.FoundOpeningTagPrefix);
					if (!currentElement.tag) {
						currentElement = openerSuffixEvents[openerSuffixEvents.length - 1].element;
					}
					historyCutoffIndex = elementOpenerPrefixEvent - 1;
				}
				events.length = historyCutoffIndex + 1;
				events[events.length - 1].index = i + 1;

				outputArray.push(currentElement);
				currentElement = { tag: '', attributes: {}, children: [] };
				break;
			}
			default: {
				// Ensure exhaustiveness by making the default case a compile-time error
				const _unhandledEventName: never = mostRecentEventName;
				throw new Error(`Unexpected event ${_unhandledEventName}`);
			}
		}
		i++;
	} while (i <= shortcode.length);

	return returnValue;
}

export function stringify(elements: (string | ShortcodeElement)[]): string {
	function serializeElement(element: string | ShortcodeElement): string {
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
