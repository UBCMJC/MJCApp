import { Constants } from './Constants';
import { NewGameUtils } from './NewGameUtils';

export var PointCalculationUtils = {
    jpn: {
        dealin_delta,
        selfdraw_delta,
        mistake_delta
    }
};

function dealin_delta(points, fu, winnerWind, loserWind, riichiSticks) {
	let winds = {};
	winds[Constants.EAST] = winds[Constants.SOUTH] = winds[Constants.WEST] = winds[Constants.NORTH] = 0;

	let basicPoints;
	let multiplier = (winnerWind != NewGameUtils.roundToDealerDirection(Number(Session.get("current_round")))) ? 4 : 6;
	let manganPayout = multiplier * Constants.MANGAN_BASIC_POINTS;

	if (points < 5) {
		if (fu == 20 || (points == 1 && fu == 25)) {
			return 0; // Issue Protection
		} else {
			basicPoints = Math.ceil((fu * Math.pow(2, 2 + points)) * multiplier /100) * 100;
			basicPoints = basicPoints < manganPayout ? basicPoints : manganPayout;
		}
	} else {
		switch (points) {
		case 5: basicPoints = manganPayout; break;
		case 6:
		case 7: basicPoints = manganPayout * 1.5; break;
		case 8:
		case 9:
		case 10: basicPoints = manganPayout * 2; break;
		case 11:
		case 12: basicPoints = manganPayout * 3; break;
		case 13: basicPoints = manganPayout * 4; break;
		case 26: basicPoints = manganPayout * 4 * 2; break;
		case 39: basicPoints = manganPayout * 4 * 3; break;
		case 52: basicPoints = manganPayout * 4 * 4; break;
		case 65: basicPoints = manganPayout * 4 * 5; break;
		}
	}

	winds[winnerWind] = basicPoints + 300 * Number(Session.get("current_bonus")) + riichiSticks * 1000;
	winds[loserWind] = -basicPoints - 300 * Number(Session.get("current_bonus"));

	Session.set("free_riichi_sticks", 0);
	return winds;
};

function selfdraw_delta(points, fu, winnerWind, riichiSticks) {
	let winds = {};
	winds[Constants.EAST] = winds[Constants.SOUTH] = winds[Constants.WEST] = winds[Constants.NORTH] = 0;

	let basicPoints;
	let dealerWind = NewGameUtils.roundToDealerDirection(Number(Session.get("current_round")));

	if (points < 5) {
		if (points == 1 && (fu == 20 || fu == 25)) {
			return 0; // Issue Protection
		} else {
			basicPoints = fu * Math.pow(2, 2 + points);
			basicPoints = basicPoints < Constants.MANGAN_BASIC_POINTS ? basicPoints : Constants.MANGAN_BASIC_POINTS;
		}
	} else {
		switch (points) {
		case 5: basicPoints = Constants.MANGAN_BASIC_POINTS; break;
		case 6:
		case 7: basicPoints = Constants.MANGAN_BASIC_POINTS * 1.5; break;
		case 8:
		case 9:
		case 10: basicPoints = Constants.MANGAN_BASIC_POINTS * 2; break;
		case 11:
		case 12: basicPoints = Constants.MANGAN_BASIC_POINTS * 3; break;
		case 13: basicPoints = Constants.MANGAN_BASIC_POINTS * 4; break;
		case 26: basicPoints = Constants.MANGAN_BASIC_POINTS * 4 * 2; break;
		case 39: basicPoints = Constants.MANGAN_BASIC_POINTS * 4 * 3; break;
		case 52: basicPoints = Constants.MANGAN_BASIC_POINTS * 4 * 4; break;
		case 65: basicPoints = Constants.MANGAN_BASIC_POINTS * 4 * 5; break;
		};
	}

	let nonDealerPays = Math.ceil(basicPoints/100 * (dealerWind == winnerWind ? 2 : 1)) * 100;
	let dealerPays = Math.ceil(basicPoints/100 * 2) * 100;

	let bonuses = Number(Session.get("current_bonus"));

	for (let w in winds) {
		if (winnerWind != dealerWind) {
			if (w == dealerWind) {
				winds[w] = -dealerPays - 100 * bonuses;
			} else if (w == winnerWind) {
				winds[w] = dealerPays + 2 * nonDealerPays + 300 * bonuses + riichiSticks * 1000;
			} else {
				winds[w] = -nonDealerPays - 100 * bonuses;
			}
		} else {
			if (w == winnerWind) {
				winds[w] = 3 * nonDealerPays + riichiSticks * 1000;
			} else {
				winds[w] = -nonDealerPays;
			}
		}
	}

	Session.set("free_riichi_sticks", 0);
	return winds;
};

function mistake_delta(loser) {
    let winds = {};
    winds[Constants.EAST] = winds[Constants.SOUTH] = winds[Constants.WEST] = winds[Constants.NORTH] = 4000;

	winds[loser] = -12000;

	return winds;
};
