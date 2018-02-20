// Collections
import CurrentGames from '../../api/CurrentGames';
import Players from '../../api/Players';

// API
import Constants from '../../api/Constants';
import GameRecordUtils from '../../api/utils/GameRecordUtils';

import './CurrentGames.html';

// GUI helpers for game display template
Template.CurrentGames.helpers({
    // Return all current games as an array
    games() {
	return CurrentGames.find({}, {sort: { timestamp: 1 }});
    }
});

Template.game_display.helpers({
    timestampToDate(timestamp) {
	return moment(timestamp).format("MMMM Do, HH:mm:ss");
    },
    styleToText(style) {
	switch (style) {
	case Constants.GAME_TYPE.HONG_KONG:
	    return "Hong Kong";
	case Constants.GAME_TYPE.JAPANESE:
	    return "Japanese";
	default:
	    return "Invalid game type!";
	}
    },
    // TODO
    currentRound(hands, style) {
	let lastHand = hands[hands.length - 1];
	let round = lastHand.round;

	switch (style) {
	case Constants.GAME_TYPE.HONG_KONG:
	    switch (lastHand.handType) {
	    case Constants.RESTART:
	    case Constants.MISTAKE:
	    case Constants.NO_WIN:
		break;
	    case Constants.DEAL_IN:
	    case Constants.SELF_DRAW:
		if (lastHand.deltas[(lastHand.round - 1) % 4] < 0)
		    ++round;
		break;
	    };
	    break;
	    
	case Constants.GAME_TYPE.JAPANESE:
	    switch (lastHand.handType) {
	    case Constants.RESTART:
	    case Constants.MISTAKE:
		break;
	    case Constants.DEAL_IN:
	    case Constants.SELF_DRAW:
		if (lastHand.deltas[(lastHand.round - 1) % 4] <= 0)
		    ++round;
		break;
	    case Constants.NO_WIN:
		if (lastHand.deltas[(lastHand.round - 1) % 4] < 0)
		    ++round;
		break;
	    };
	    break;
	};

	return GameRecordUtils.displayRoundWind(round, style) + round;
	    
    },
    currentBonus(hands, style) {
	let lastHand = hands[hands.length - 1];
	let bonus = lastHand.bonus;

	switch (style) {
	case Constants.GAME_TYPE.HONG_KONG:
	    switch (lastHand.handType) {
	    case Constants.MISTAKE:
		break;
	    case Constants.RESTART:
	    case Constants.NO_WIN:
		++bonus;
		break;
	    case Constants.DEAL_IN:
	    case Constants.SELF_DRAW:
		if (lastHand.deltas[(lastHand.round - 1) % 4] > 0)
		    ++bonus;
		else
		    bonus = 0;
		break;
	    }
	    break;
	case Constants.GAME_TYPE.JAPANESE:
	    switch (lastHand.handType) {
	    case Constants.MISTAKE:
		break;
	    case Constants.RESTART:
	    case Constants.NO_WIN:
		++bonus;
		break;
	    case Constants.DEAL_IN:
	    case Constants.SELF_DRAW:
		if (lastHand.deltas[(lastHand.round - 1) % 4] > 0)
		    ++bonus;
		else
		    bonus = 0;
		break;
	    }
	    break;
	}
	return bonus;
    },
    getPlayer(players, seat) {
	switch (seat) {
	case Constants.EAST:
	    return players[0];
	case Constants.SOUTH:
	    return players[1];
	case Constants.WEST:
	    return players[2];
	case Constants.NORTH:
	    return players[3];
	default:
	    return "Invalid player!";
	}
    },
    getElo(style, player) {
	switch (style) {
	case Constants.GAME_TYPE.HONG_KONG:
	    return Players.findOne({hongKongLeagueName: player}).hongKongElo.toFixed(2);
	case Constants.GAME_TYPE.JAPANESE:
	    return Players.findOne({japaneseLeagueName: player}).japaneseElo.toFixed(2);	    
	}
    },
    isHongKongStyle(style) {
	return style === Constants.GAME_TYPE.HONG_KONG;
    },
    isJapaneseStyle(style) {
	return style === Constants.GAME_TYPE.JAPANESE;
    }
});

Template.hkg_hand_display.helpers({
    isWin(handType) {
	return handType === Constants.DEAL_IN || handType === Constants.SELF_DRAW;
    },
    isNoWin(handType) {
	return handType === Constants.NO_WIN ||
	    handType === Constants.RESTART ||
	    handType === Constants.MISTAKE;
    },
    handTypeToString(handType) {
	switch (handType) {
	case Constants.NO_WIN:
	    return "No Win!";
	case Constants.RESTART:
	    return "Reshuffle!";
	case Constants.MISTAKE:
	    return "Mistake!";
	default:
	    return "Invalid Hand";
	}
    },
    displayRoundWind(round) {
	return GameRecordUtils.displayRoundWind(round, Constants.GAME_TYPE.HONG_KONG);
    },
    displayTrueRound(round) {
	return GameRecordUtils.handNumberToRoundNumber(round,
	                                               Constants.GAME_TYPE.HONG_KONG);
    },
    getDelta(deltas, position) {
	switch (position) {
	case Constants.EAST:
	    return deltas[0];
	case Constants.SOUTH:
	    return deltas[1];
	case Constants.WEST:
	    return deltas[2];
	case Constants.NORTH:
	    return deltas[3];
	default:
	    return "Invalid position!";
	}
    }
});

Template.jpn_hand_display.helpers({
    isWin(handType) {
	return handType === Constants.DEAL_IN || handType === Constants.SELF_DRAW;
    },
    isNoWin(handType) {
	return handType === Constants.NO_WIN ||
	    handType === Constants.RESTART ||
	    handType === Constants.MISTAKE;
    },
    handTypeToString(handType) {
	switch (handType) {
	case Constants.NO_WIN:
	    return "No Win!";
	case Constants.RESTART:
	    return "Reshuffle!";
	case Constants.MISTAKE:
	    return "Mistake!";
	default:
	    return "Invalid Hand";
	}
    },
    displayRoundWind(round) {
	return GameRecordUtils.displayRoundWind(round, Constants.GAME_TYPE.JAPANESE);
    },
    displayTrueRound(round) {
	return GameRecordUtils.handNumberToRoundNumber(round,
	                                               Constants.GAME_TYPE.JAPANESE);
    },
    getDelta(deltas, position) {
	switch (position) {
	case Constants.EAST:
	    return deltas[0];
	case Constants.SOUTH:
	    return deltas[1];
	case Constants.WEST:
	    return deltas[2];
	case Constants.NORTH:
	    return deltas[3];
	default:
	    return "Invalid position!";
	}
    }
});
