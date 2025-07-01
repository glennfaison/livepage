export const shortcodeSamples = [
	{
		shortcode: '[/box/]',
		parsedResult: ['[/box/]'],
	},
	{
		shortcode: '[box]',
		parsedResult: ['[box]'],
	},
	{
		shortcode: '[box/]',
		parsedResult: [{
			tag: "box",
			attributes: {},
			children: [],
		}],
	},
	{
		shortcode: '[box /]',
		parsedResult: [{
			tag: "box",
			attributes: {},
			children: [],
		}],
	},
	{
		shortcode: '[ box /]',
		parsedResult: ['[ box /]'],
	},
	{
		shortcode: '[box / ]',
		parsedResult: ['[box / ]'],
	},
	{
		shortcode: '[circle/]',
		parsedResult: [{
			tag: "circle",
			attributes: {},
			children: [],
		}],
	},
	{
		shortcode: '[circle		/]',
		parsedResult: [{
			tag: "circle",
			attributes: {},
			children: [],
		}],
	},
	{
		shortcode: '[circle 	radius /]',
		parsedResult: [{
			tag: "circle",
			attributes: { "radius": "", },
			children: [],
		}],
	},
	{
		shortcode: '[circle color	radius /]',
		parsedResult: [{
			tag: "circle",
			attributes: { "color": "", "radius": "", },
			children: [],
		}],
	},
	{
		shortcode: '[circle color	radius/]',
		parsedResult: [{
			tag: "circle",
			attributes: { "color": "", "radius": "", },
			children: [],
		}],
	},
	{
		shortcode: '[circle radius="10" /]',
		parsedResult: [{
			tag: "circle",
			attributes: { "radius": "10", },
			children: [],
		}],
	},
	{
		shortcode: '[box height="9"/]',
		parsedResult: [{
			tag: "box",
			attributes: {
				"height": "9",
			},
			children: [],
		}],
	},
	{
		shortcode: '[box height=9/]',
		parsedResult: [{
			tag: "box",
			attributes: {
				"height": "9",
			},
			children: [],
		}],
	},
	{
		shortcode: '[box height="9" /]',
		parsedResult: [{
			tag: "box",
			attributes: {
				"height": "9",
			},
			children: [],
		}],
	},
	{
		shortcode: '[box height="18"/]',
		parsedResult: [{
			tag: "box",
			attributes: {
				"height": "18",
			},
			children: [],
		}],
	},
	{
		shortcode: '[box height="18" width=9/]',
		parsedResult: [{
			tag: "box",
			attributes: {
				"height": "18",
				"width": "9",
			},
			children: [],
		}],
	},
	{
		shortcode: '[box height="18" width="9" /]',
		parsedResult: [{
			tag: "box",
			attributes: {
				"height": "18",
				"width": "9",
			},
			children: [],
		}],
	},
	{
		shortcode: '[special-element_one --attribute_one-1 -attr-2="_two-thirds" _attr-3="just anything" /]',
		parsedResult: [{
			tag: "special-element_one",
			attributes: {
				"--attribute_one-1": "",
				"-attr-2": "_two-thirds",
				"_attr-3": "just anything",
			},
			children: [],
		}],
	},
	{
		shortcode: '[special-element_one --attribute_one-1 -attr-2="_two-thirds" _attr-3="just anything"][/special-element_one]',
		parsedResult: [
			{
				tag: 'special-element_one',
				attributes: {
					"--attribute_one-1": "",
					"-attr-2": "_two-thirds",
					"_attr-3": "just anything",
				},
				children: [],
			},
		],
	},
	{
		shortcode: '[special-element_one --attribute_one-1 -attr-2=_two-thirds _attr-3="just anything"]   [/special-element_one]',
		parsedResult: [
			{
				tag: 'special-element_one',
				attributes: {
					"--attribute_one-1": "",
					"-attr-2": "_two-thirds",
					"_attr-3": "just anything",
				},
				children: [],
			},
		],
	},
	{
		shortcode: '[box/][special-element_one --attribute_one-1 -attr-2="_two-thirds" _attr-3="just anything"][/special-element_one][circle radius="1" ] [/circle]',
		parsedResult: [
			{ tag: "box", attributes: {}, children: [], },
			{
				tag: 'special-element_one',
				attributes: {
					"--attribute_one-1": "",
					"-attr-2": "_two-thirds",
					"_attr-3": "just anything",
				},
				children: [],
			},
			{ tag: "circle", attributes: { "radius": "1", }, children: [], },
		],
	},
	{
		shortcode: '[special-element_one --attribute_one-1 -attr-2="_two-thirds" _attr-3="just anything"] this is text! [/special-element_one]',
		parsedResult: [
			{
				tag: 'special-element_one',
				attributes: {
					"--attribute_one-1": "",
					"-attr-2": "_two-thirds",
					"_attr-3": "just anything",
				},
				children: ['this is text!'],
			},
		],
	},
	{
		shortcode: '[special-element_one --attribute_one-1 -attr-2="_two-thirds" _attr-3="just anything"][box/][circle radius="1" ] [/circle][/special-element_one]',
		parsedResult: [
			{
				tag: 'special-element_one',
				attributes: {
					"--attribute_one-1": "",
					"-attr-2": "_two-thirds",
					"_attr-3": "just anything",
				},
				children: [
					{ tag: "box", attributes: {}, children: [], },
					{ tag: "circle", attributes: { "radius": "1", }, children: [], },
				],
			},
		],
	},
	{
		shortcode: 'tlso db[special-[ element_one --attribute_one-1 -attr-2=_two-thirds _attr-3="just anything"][box/][circle radius="1" ] [/circle][/special-element_one]',
		parsedResult: [
			'tlso db[special-[ element_one --attribute_one-1 -attr-2=_two-thirds _attr-3="just anything"]',
			{ tag: "box", attributes: {}, children: [], },
			{ tag: "circle", attributes: { "radius": "1", }, children: [], },
			'[/special-element_one]'
		],
	},
	{
		shortcode: 'tlso db[box][circle radius="1" ] [/box] [/circle][/special-element_one]',
		parsedResult: [
			'tlso db',
			{ tag: "box", attributes: {}, children: ['[circle radius="1" ]'], },
			'[/circle][/special-element_one]'
		],
	},
	{
		shortcode: '[triangle]tlso db[box][circle radius="1" ] [/box] [/circle][/special-element_one][/triangle]',
		parsedResult: [
			{
				tag: "triangle",
				attributes: {},
				children: [
					'tlso db',
					{ tag: "box", attributes: {}, children: ['[circle radius="1" ]'], },
					'[/circle][/special-element_one]'
				],
			},
		],
	},
	{
		shortcode: '[triangle]tlso db[box][circle radius="1" ] [/box] [/circle][/special-element_one][/triangle]',
		acceptedTags: ['triangle', 'circle'],
		parsedResult: [
			{
				tag: "triangle",
				attributes: {},
				children: [
					'tlso db[box]',
					{ tag: "circle", attributes: { radius: "1" }, children: ['[/box]'], },
					'[/special-element_one]'
				],
			},
		],
	},
	{
		shortcode: '[a][b][c][d] [e] [f/][/e][/d] [/c]',
		parsedResult: [
			'[a][b]',
			{
				tag: "c",
				attributes: {},
				children: [
					{
						tag: "d",
						attributes: {},
						children: [
							{
								tag: "e",
								attributes: {},
								children: [
									{
										tag: "f",
										attributes: {},
										children: [],
									},
								],
							},
						],
					},
				],
			},
		],
	},
	{
		shortcode: '[a][b][c][d][e][f/][/e][/d][/c] [a][b][c][d][e][f/][/e][/d][/c]',
		parsedResult: [
			'[a][b]',
			{
				tag: "c",
				attributes: {},
				children: [
					{
						tag: "d",
						attributes: {},
						children: [
							{
								tag: "e",
								attributes: {},
								children: [
									{
										tag: "f",
										attributes: {},
										children: [],
									},
								],
							},
						],
					},
				],
			},
			'[a][b]',
			{
				tag: "c",
				attributes: {},
				children: [
					{
						tag: "d",
						attributes: {},
						children: [
							{
								tag: "e",
								attributes: {},
								children: [
									{
										tag: "f",
										attributes: {},
										children: [],
									},
								],
							},
						],
					},
				],
			},
		],
	},
	{
		shortcode: `
		[page id=page-1 title="Home Page"]
			[row id=row-968frt6]
				[header1 id=header1-460fc7b]Header 1[/header1]
			[/row]
			[row id=row-6d4pfj7]
				[paragraph id=paragraph-fsusmgq]
					Morbi consequat justo enim, sed accumsan metus blandit eget.
				[/paragraph]
			[/row]
		[/page]
		`,
		parsedResult: [{
			tag: "page",
			attributes: { id: "page-1", title: "Home Page" },
			children: [
				{
					tag: "row",
					attributes: { id: "row-968frt6" },
					children: [{ tag: "header1", attributes: { id: "header1-460fc7b" }, children: ["Header 1"] }],
				},
				{
					tag: "row",
					attributes: { id: "row-6d4pfj7" },
					children: [{ tag: "paragraph", attributes: { id: "paragraph-fsusmgq" }, children: ["Morbi consequat justo enim, sed accumsan metus blandit eget."] }],
				},
			],
		}],
	},
];

export const parsedShortcodeElementSamples = [
	{
		parsedElements: [
			{
				tag: "triangle",
				attributes: {},
				children: [
					'tlso db',
					{ tag: "box", attributes: {}, children: ['[circle radius="1" ]'], },
					'[/circle][/special-element_one]'
				],
			},
		],
		stringifiedResult: '[triangle]tlso db[box][circle radius="1" ][/box][/circle][/special-element_one][/triangle]',
	},
	{
		parsedElements: [
			'this is text!',
			{
				tag: "triangle",
				attributes: {},
				children: [
					'tlso db',
					{ tag: "box", attributes: {}, children: ['[circle radius="1" ]'], },
					'[/circle][/special-element_one]'
				],
			},
			{ tag: "circ", attributes: {}, children: ['[box color="red" ]'], },
		],
		stringifiedResult: 'this is text![triangle]tlso db[box][circle radius="1" ][/box][/circle][/special-element_one][/triangle][circ][box color="red" ][/circ]',
	},
];