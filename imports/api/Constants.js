// A class/namespace of commonly used Constants
export const Constants = {
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
};

// Getter for GUI display of Japanese game start points
Template.registerHelper("get_jpn_start_points", function () {
	return Constants.JPN_START_POINTS;
});