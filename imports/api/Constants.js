// A class/namespace of commonly used Constants
export const Constants = {
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

	// Base points of a mangan
	JPN_MANGAN_BASE_POINTS: 2000,

	// Points for every bonus round
	JPN_BONUS_POINTS: 300,

	// Points for every riichi stick
	JPN_RIICHI_POINTS: 1000,

	// Points paid for a mistake
	JPN_MISTAKE_POINTS: 12000,

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
	MISTAKE: "fuckup",

	EAST: "east",
	SOUTH: "south",
	WEST: "west",
	NORTH: "north",

	PRIORITY: {
		east: 3,
		south: 2,
		north: 1,
		west: 0
	}
};

Constants.WINDS = [Constants.EAST, Constants.SOUTH, Constants.WEST, Constants.NORTH];

Object.keys(Constants).forEach((k) => { Template.registerHelper(k, () => Constants[k] )});
