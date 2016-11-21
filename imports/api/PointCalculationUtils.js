import { Constants } from './Constants';
import { NewGameUtils } from './NewGameUtils';

export var PointCalculationUtils = {
	jpn: {
		dealin_delta: jpn_dealin_delta,
		selfdraw_delta: jpn_selfdraw_delta,
		mistake_delta: jpn_mistake_delta
	}
};

/**
 * Calculates the change in points as a result of a deal-in hand
 * Uses the formula from https://en.wikipedia.org/wiki/Japanese_Mahjong_scoring_rules
 *
 * @param {number} points - the total number of han + dora
 * @param {number} fu - the fu value of the hand
 * @param {string} winnerWind - the winning seat wind
 * @param {string} loserWind - the losing seat wind
 * @param {number} riichiSticks - the total number of thrown riichi sticks
 * @return {Object} containing the point difference for each seat
 */
function jpn_dealin_delta(points, fu, winnerWind, loserWind, riichiSticks) {
	let winds = {};
	winds[Constants.EAST] = winds[Constants.SOUTH] = winds[Constants.WEST] = winds[Constants.NORTH] = 0;

	let basicPoints;
	let currentBonus = Number(Session.get("current_bonus")) * Constants.JPN_BONUS_POINTS;

	// The multiplier is for whether or not it's a dealer victory
	let multiplier = (winnerWind != NewGameUtils.roundToDealerDirection(Number(Session.get("current_round")))) ? 4 : 6;

	// Check to see if you have to count basic points
	if (points < 5) {
		if (fu == 20 || (points == 1 && fu == 25)) {
			return 0; // Issue Protection
		} else {
			let manganPayout = Constants.JPN_MANGAN_BASE_POINTS * multiplier;
			basicPoints = Math.ceil((fu * Math.pow(2, 2 + points)) * multiplier / 100) * 100;
			basicPoints = basicPoints < manganPayout ? basicPoints : manganPayout;
		}
	} else {
		basicPoints = manganValue(points) * multiplier;
	}

	winds[winnerWind] = basicPoints + currentBonus + (riichiSticks * Constants.JPN_RIICHI_POINTS);
	winds[loserWind] = -(basicPoints + currentBonus);

	return winds;
};


/**
 * Calculates the change in points as a result of a self-drawn hand
 * Uses the formula from https://en.wikipedia.org/wiki/Japanese_Mahjong_scoring_rules
 *
 * @param {number} points - the total number of han + dora
 * @param {number} fu - the fu value of the hand
 * @param {string} winnerWind - the winning seat wind
 * @param {number} riichiSticks - the total number of thrown riichi sticks
 * @return {Object} containing the point difference for each seat
 */
function jpn_selfdraw_delta(points, fu, winnerWind, riichiSticks) {
	let winds = {};
	let dealerWind = NewGameUtils.roundToDealerDirection(Number(Session.get("current_round")));

	let basicPoints;
	let nonDealerPays;
	let dealerPays;

	let currentBonus = Number(Session.get("currentBonus"));
	let individualBonusPayout = Constants.JPN_BONUS_POINTS / 3;

	winds[Constants.EAST] = winds[Constants.SOUTH] = winds[Constants.WEST] = winds[Constants.NORTH] = 0;

	// Check to see if you have to count basic points
	if (points < 5) {
		if (points == 1 && (fu == 20 || fu == 25)) {
			return 0; // Issue Protection
		} else {
			basicPoints = fu * Math.pow(2, 2 + points);
			basicPoints = basicPoints < Constants.JPN_MANGAN_BASE_POINTS ? basicPoints : Constants.JPN_MANGAN_BASE_POINTS;
		}
	} else {
		basicPoints = manganValue(points);
	}

	nonDealerPays = Math.ceil(basicPoints / 100 * (dealerWind == winnerWind ? 2 : 1)) * 100;
	dealerPays = Math.ceil(basicPoints / 100 * 2) * 100;

	for (let w in winds) {
		if (winnerWind != dealerWind) {
			if (w == dealerWind) {
				winds[w] = -(dealerPays + currentBonus * individualBonusPayout);
			} else if (w == winnerWind) {
				winds[w] = dealerPays + (nonDealerPays * 2) + (currentBonus * Constants.JPN_BONUS_POINTS) + (riichiSticks * Constants.JPN_RIICHI_POINTS);
			} else {
				winds[w] = -(nonDealerPays + currentBonus * individualBonusPayout);
			}
		} else {
			if (w == winnerWind) {
				winds[w] = (nonDealerPays * 3) + (currentBonus * Constants.JPN_BONUS_POINTS) + (riichiSticks * Constants.JPN_RIICHI_POINTS);
			} else {
				winds[w] = -(nonDealerPays + (currentBonus * individualBonusPayout));
			}
		}
	}

	return winds;
};

/**
 * Calculates the point difference as the result of a mistaken hand
 * @param {string} loser - the losing seat wind
 * @return {Object} containing the point difference for each seat
 */
function jpn_mistake_delta(loser) {
	let winds = {};
	winds[Constants.EAST] = winds[Constants.SOUTH] = winds[Constants.WEST] = winds[Constants.NORTH] = Constants.JPN_MISTAKE_POINTS / 3;

	winds[loser] = -Constants.JPN_MISTAKE_POINTS;

	return winds;
};

/**
 * Calculates the total base points from han + dora values for high value hands
 * @param {number} points - total points from han + dora
 * @returns {number} representing number of base points as the result of a certain point threshold
 */
function manganValue(points) {
	switch(points) {
	case 5: return Constants.JPN_MANGAN_BASE_POINTS;
	case 6:
	case 7: return Constants.JPN_MANGAN_BASE_POINTS * 1.5;
	case 8:
	case 9:
	case 10: return Constants.JPN_MANGAN_BASE_POINTS * 2;
	case 11:
	case 12: return Constants.JPN_MANGAN_BASE_POINTS * 3;
	case 13: return Constants.JPN_MANGAN_BASE_POINTS * 4;
	case 26: return Constants.JPN_MANGAN_BASE_POINTS * 4 * 2;
	case 39: return Constants.JPN_MANGAN_BASE_POINTS * 4 * 3;
	case 52: return Constants.JPN_MANGAN_BASE_POINTS * 4 * 4;
	case 65: return Constants.JPN_MANGAN_BASE_POINTS * 4 * 5;
	}
}