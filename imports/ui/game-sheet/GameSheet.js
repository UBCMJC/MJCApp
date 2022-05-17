import Players from '../../api/Players';

import Constants from '../../api/Constants';
import EloCalculator from '../../api/EloCalculator';
import GameRecordUtils from  '../../api/utils/GameRecordUtils';

import './GameSheet.html'

/**
 * Retreives the appropriate start points for a game
 * @param[in] style The game style to get the start points for
 *
 * @returns {Number} The starting points for a mahjong game
 */
function _getStartPoints(style) {
    switch (style) {
    case Constants.GAME_TYPE.HONG_KONG:
	return Constants.HKG_START_POINTS;
    case Constants.GAME_TYPE.JAPANESE:
	return Constants.JPN_START_POINTS;
    }
};

/**
 * Template predicate to determine if game is Hong Kong style
 * @param[in] style The game style
 *
 * @returns {Boolean} Whether the game is Hong Kong style
 */
function _isHongKong(style) {
    return style === Constants.GAME_TYPE.HONG_KONG;
};

/**
 * Template predicate to determine if game is Japanese style
 * @param[in] style The game style
 *
 * @returns {Boolean} Whether the game is Japanese style
 */
function _isJapanese(style) {
    return style === Constants.GAME_TYPE.JAPANESE;
};

Template.GameSheet.helpers({
    /**
     * Provide number of information columns for a hand for a style
     * @param[in] style The style to determine the information columns for
     *
     * @returns {Number} A number of information columns
     */
    getInfoColumnWidth(style) {
	switch (style) {
	case Constants.GAME_TYPE.HONG_KONG:
	    return 2;
	case Constants.GAME_TYPE.JAPANESE:
	    return 4;
	}
    },
    /**
     * Template predicate to determine if game is Hong Kong style
     * @param[in] style The game style
     *
     * @returns {Boolean} Whether the game is Hong Kong style
     */
    isHongKong: _isHongKong,
    /**
     * Template predicate to determine if game is Japanese style
     * @param[in] style The game style
     *
     * @returns {Boolean} Whether the game is Japanese style
     */
    isJapanese: _isJapanese,
    /**
     * Retreives the appropriate start points for a game
     * @param[in] style The game style
     *
     * @returns {Number} The starting points for a mahjong game
     */
    getStartPoints: _getStartPoints,
    /**
     * Retrieve the pre-game ELO for a player for a certain style
     * @param[in] player The player to retreive ELO for
     * @param[in] style The game style
     *
     * @returns An ELO truncated to 2 decimal points
     */
    getElo(player, style) {
	switch (player) {
	case Constants.DEFAULT_EAST:
	case Constants.DEFAULT_SOUTH:
	case Constants.DEFAULT_WEST:
	case Constants.DEFAULT_NORTH:
	    return "?";
	default:
	    switch (style) {
	    case Constants.GAME_TYPE.HONG_KONG:
		return Players.findOne({hongKongLeagueName: player}).hongKongElo.toFixed(2);
	    case Constants.GAME_TYPE.JAPANESE:
		return Players.findOne({japaneseLeagueName: player}).japaneseElo.toFixed(2);
	    }
	};
    },
    /**
     * Retrieve the current gain or loss for a player
     * @param[in] direction The seat to get plus minus for
     * @param[in] style The game style
     *
     * @returns The gain or loss of a player
     */
    getPlayerDelta(direction, style) {
        return (GameRecordUtils.getDirectionScore(direction) - _getStartPoints(style));
    },
    /**
     * Retreive the current score for a player
     * @param[in] direction The seat to get the current score for
     * @param[in] style The game style
     *
     * @returns The current score of a player
     */
    getPlayerScore(direction) {
        return GameRecordUtils.getDirectionScore(direction);
    },
    /**
     * Retreive the final score for a player
     * @param[in] direction The seat to get the final score for
     * @param[in] style The game style
     *
     * @returns The final score of a player
     */
    getPlayerScoreFinal(direction, style) {
        let retval = GameRecordUtils.getDirectionScore(direction);

	if (style === Constants.GAME_TYPE.JAPANESE) {
	    let winScore = Math.max(Number(Session.get("east_score")),
				    Number(Session.get("south_score")),
				    Number(Session.get("west_score")),
				    Number(Session.get("north_score")));

	    
            if (winScore == Session.get("east_score")) {
		if (direction == Constants.EAST)
                    retval += Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks"));
            } else if (winScore == Session.get("south_score")) {
		if (direction == Constants.SOUTH)
                    retval += Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks"));
	    } else if (winScore == Session.get("west_score")) {
		if (direction == Constants.WEST)
                    retval += Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks"));
            } else if (winScore == Session.get("north_score")) {
		if (direction == Constants.NORTH)
                    retval += Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks"));
            }
	}

	return retval;
    },
    /**
     * @param[in] round The round to display the wind for
     * @param[in] style The game style
     *
     * @returns a string of the round wind
     */
    displayRoundWind(round, style) {
        return GameRecordUtils.displayRoundWind(round, style);
    },
    /**
     * @param[in] round The round to display the number for
     * @param[in] style The game style
     *
     * @returns the current round number for Hong Kong style
     */
    displayRoundNumber(round, style) {
        return GameRecordUtils.handNumberToRoundNumber(round, style);
    },
    /**
     * Show what a player's Elo change will look like if game is ended now
     * @param[in] direction The seat to get the ELO for
     * @param[in] style The game style
     *
     * @returns An expected ELO change
     */
    getExpectedEloChange(direction, style) {

        let eastPlayer  = Session.get("current_east");
        let southPlayer = Session.get("current_south");
        let westPlayer  = Session.get("current_west");
        let northPlayer = Session.get("current_north");

        if (eastPlayer  == Constants.DEFAULT_EAST ||
            southPlayer == Constants.DEFAULT_SOUTH ||
            westPlayer  == Constants.DEFAULT_WEST ||
            northPlayer == Constants.DEFAULT_NORTH) {
            return "N/A";
        }

        let game = {
            timestamp: Date.now(),
            east_player: eastPlayer,
            south_player: southPlayer,
            west_player: westPlayer,
            north_player: northPlayer,
            east_score: (Number(Session.get("east_score"))),
            south_score: (Number(Session.get("south_score"))),
            west_score: (Number(Session.get("west_score"))),
            north_score: (Number(Session.get("north_score"))),
            all_hands: Template.instance().data.game.hands,
        };

	let scoreAdjustment;

	switch (style) {
	case Constants.GAME_TYPE.HONG_KONG:
	    scoreAdjustment = Constants.HKG_SCORE_ADJUSTMENT;
	case Constants.GAME_TYPE.JAPANESE:
	    scoreAdjustment = Constants.JPN_SCORE_ADJUSTMENT;
	}

        let gameEloCalculator = new EloCalculator(Constants.ELO_CALCULATOR_N,
                                                  Constants.ELO_CALCULATOR_EXP,
                                                  scoreAdjustment,
                                                  game,
                                                  style);

        switch (direction) {
        case Constants.EAST:  return gameEloCalculator.eloChange(eastPlayer).toFixed(2);
        case Constants.SOUTH: return gameEloCalculator.eloChange(southPlayer).toFixed(2);
        case Constants.WEST:  return gameEloCalculator.eloChange(westPlayer).toFixed(2);
        case Constants.NORTH: return gameEloCalculator.eloChange(northPlayer).toFixed(2);
        };
    },
});


Template.RenderHand.helpers({
    isHongKong: _isHongKong,
    isJapanese: _isJapanese,
    isDealin(hand_type) {
        return hand_type == Constants.DEAL_IN;
    },
    isSelfdraw(hand_type) {
        return hand_type == Constants.SELF_DRAW;
    },
    isNowin(hand_type) {
        return hand_type == Constants.NO_WIN;
    },
    isRestart(hand_type) {
        return hand_type == Constants.RESTART;
    },
    isMistake(hand_type) {
        return hand_type == Constants.MISTAKE;
    },
    // Return a string of the round wind for Hong Kong style
    displayRoundWind(round, style) {
        return GameRecordUtils.displayRoundWind(round, style);
    },
    // Return the current round number for Hong Kong style
    displayRoundNumber(round, style) {
        return GameRecordUtils.handNumberToRoundNumber(round, style);
    },
});
