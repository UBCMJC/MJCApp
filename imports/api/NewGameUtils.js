import { Constants } from '../api/Constants.js';

export var NewGameUtils = {

	resetGameValues(defaultScore) {
		Session.set("current_east", Constants.DEFAULT_EAST);
		Session.set("current_south", Constants.DEFAULT_SOUTH);
		Session.set("current_west", Constants.DEFAULT_WEST);
		Session.set("current_north", Constants.DEFAULT_NORTH);

		Session.set("round_winner", Constants.NO_PERSON);
		Session.set("round_loser", Constants.NO_PERSON);
		Session.set("round_pao_player", Constants.NO_PERSON);

		Session.set("east_score", defaultScore);
		Session.set("south_score", defaultScore);
		Session.set("west_score", defaultScore);
		Session.set("north_score", defaultScore);

		Session.set("current_round", 1);
		Session.set("current_bonus", 0);
		Session.set("current_points", 0);
		Session.set("east_score_fuckup", 0);
		Session.set("south_score_fuckup", 0);
		Session.set("west_score_fuckup", 0);
		Session.set("north_score_fuckup", 0);
	},

	// UX: Convert a round and gametype into the correct round wind
	displayRoundWind(round, gameType) {

		// This code could be streamlined, but let's leave it explicit
		switch (gameType) {
		case Constants.GAME_TYPE.HONG_KONG:
			if (round <= 4)
				return "東";
			if (round > 4 && round <= 8)
				return "南";
			if (round > 8 && round <= 12)
				return "西";
			else //if (round > 12)
				return "北";
			break;
		case Constants.GAME_TYPE.JAPANESE:
			if (round <= 4)
				return "東";
			if (round > 4 && round <= 8)
				return "南";
			else //if (round > 8)
				return "西";;
			break;
		};
	},

	// Helper function to ensure all players are selected
	allPlayersSelected() {
		return (Session.get("current_east") != Constants.DEFAULT_EAST && 
	 			Session.get("current_south") != Constants.DEFAULT_SOUTH && 
	 			Session.get("current_west") != Constants.DEFAULT_WEST && 
	 			Session.get("current_north") != Constants.DEFAULT_NORTH);
	},

	someoneBankrupt() {
		return (Session.get("east_score") < 0 || 
				Session.get("south_score") < 0 ||
				Session.get("west_score") < 0 ||
				Session.get("north_score") < 0);
	},

	someoneAboveMinimum(minimum) {
		return (Session.get("east_score") > minimum ||
				Session.get("south_score") > minimum || 
				Session.get("west_score") > minimum ||
				Session.get("north_score") > minimum);
	},

	japaneseGameOver() {
		return (this.someoneBankrupt() ||
				Session.get("current_round") >= 12 ||
				(Session.get("current_round") >= 8 && 
					this.someoneAboveMinimum(Constants.JPN_END_POINTS)));
	},

	noIllegalSelfdrawJapaneseHands() {
		var retval = this.noIllegalJapaneseHands();

		retval = retval && !(Session.get("current_points") == 2 && Session.get("current_fu") == 25); 

		return retval;
	},

	noIllegalJapaneseHands() {
		var retval = true;

		retval = retval && (Session.get("current_points") != 0);
		retval = retval && (Session.get("current_fu") != 0 || Session.get("current_points") > 4);

		retval = retval && !(Session.get("current_points") == 1 && Session.get("current_fu") == 20);
		retval = retval && !(Session.get("current_points") == 1 && Session.get("current_fu") == 25);

		return retval;
	},

	getDirectionScore(direction) {
		switch (direction) {
		case "east":
			return Number(Session.get("east_score"));
		case "south":
			return Number(Session.get("south_score"));
		case "west":
			return Number(Session.get("west_score"));
		case "north":
			return Number(Session.get("north_score"));
		}
	},

	playerToDirection(player) {
		if (player == Session.get("current_east")) return "east";
		if (player == Session.get("current_south")) return "south";
		if (player == Session.get("current_west")) return "west";
		if (player == Session.get("current_north")) return "north";
	},

	roundToDealerDirection(round) {
		if (round % 4 == 1) return "east";
		if (round % 4 == 2) return "south";
		if (round % 4 == 3) return "west";
		if (round % 4 == 0) return "north";
	},
};

Template.registerHelper("get_east", function () {
	return Session.get("current_east");
});
Template.registerHelper("get_south", function () {
	return Session.get("current_south");
});
Template.registerHelper("get_west", function () {
	return Session.get("current_west");
});
Template.registerHelper("get_north", function () {
	return Session.get("current_north");
});

Template.registerHelper("get_round", function() {
	return Session.get("current_round");
});
Template.registerHelper("get_bonus", function () {
	return Session.get("current_bonus");
});