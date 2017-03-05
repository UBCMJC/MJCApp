// A class/namespace of commonly used Constants
const Constants = {
	// Title
	MAHJONG_CLUB_LEAGUE: "Mahjong Club League",

	// The starting number of points in a Hong Kong game
	HKG_START_POINTS: 500,

	// The starting number of points in a Japanese game
	JPN_START_POINTS: 25000,

	// The number of points distributed upon a tenpai round
	// from noten players to tenpai ones in a Japanese game
	JPN_TENPAI_PAYOUT: 3000,

	// The required number of points of any one player to
	// end a game at the end of "South" round in a Japanese
	// game
	JPN_END_POINTS: 30000,

	// Constants for defining the ELO calculation operation
	ELO_CALCULATOR_N: 2000,
	ELO_CALCULATOR_EXP: 5,

	// Score adjustment for Hong Kong ending scores
	// Calculated as analogous to Japanese system
	HKG_SCORE_ADJUSTMENT: [
		100,
		50,
		-50,
		-100
	],

	// Score adjustment for Japanese ending scores
	// Calculated as
	// 1st = 100,000 - 2nd - 3rd - 4th - 1st = 15,000
	// 2nd = 2nd - 30,000 + 10,000 = 5,000
	// 3rd = 3rd - 30,000 + 0 = -5,000
	// 4th = 4th - 30,000 - 10,000 = -15,000
	JPN_SCORE_ADJUSTMENT: [
		15000,
		5000,
		-5000,
		-15000
	],

	// Placeholder value to establish a player select button
	// That has no player selected
	NO_PERSON: "no one",

	// The default text to display for player buttons/fields
	// When no player has been selected
	DEFAULT_EAST: "Select East!",
	DEFAULT_SOUTH: "Select South!",
	DEFAULT_WEST: "Select West!",
	DEFAULT_NORTH: "Select North!",

	// An enum of game types for shared yet slightly altered
	// rules.  Possibly add more if ever decided to
	GAME_TYPE: {
		// Hong Kong Old Style
		HONG_KONG: "hkg",
		// Japanese Riichi Style
		JAPANESE: "jpn"
	},

	// Round End Conditions
	DEAL_IN: "dealin",
	SELF_DRAW: "selfdraw",
	NO_WIN: "nowin",
	RESTART: "restart",
	MISTAKE: "mistake"
};

export default Constants;

function registerConstants(object, prefix) {
	for (let key in object) {
		let value = object[key];
		if (value instanceof Object && !Array.isArray(value)) {
			registerConstants(value, prefix + key + ".");
		} else {
			Template.registerHelper(prefix + key, () => value);
		}
	}
}

registerConstants(Constants, "");
