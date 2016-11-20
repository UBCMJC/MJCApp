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

	if (points < 5) {
		if (fu == 20 || (points == 1 && fu == 25)) {
			return 0; // Issue Protection
		} else {
			let manganPayout = Constants.JPN_MANGAN_BASE_POINTS * multiplier;
			basicPoints = Math.ceil((fu * Math.pow(2, 2 + points)) * multiplier / 100) * 100;
			basicPoints = basicPoints < manganPayout ? basicPoints : manganPayout;
		}
	} else { basicPoints = manganValue(points) * multiplier };

	let currentBonus = Number(Session.get("current_bonus")) * 300;
	winds[winnerWind] = basicPoints + currentBonus + (riichiSticks * 1000);
	winds[loserWind] = -(basicPoints + currentBonus);

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
			basicPoints = basicPoints < Constants.JPN_MANGAN_BASE_POINTS ? basicPoints : Constants.JPN_MANGAN_BASE_POINTS;
		}
	} else { basicPoints = manganValue(points); }

	let nonDealerPays = Math.ceil(basicPoints / 100 * (dealerWind == winnerWind ? 2 : 1)) * 100;
	let dealerPays = Math.ceil(basicPoints / 100 * 2) * 100;

	let currentBonus = Number(Session.get("current_bonus"));

	for (let w in winds) {
		if (winnerWind != dealerWind) {
			if (w == dealerWind) {
				winds[w] = -(dealerPays + currentBonus * 100);
			} else if (w == winnerWind) {
				winds[w] = dealerPays + (nonDealerPays * 2) + (currentBonus * 300) + (riichiSticks * 1000);
			} else {
				winds[w] = -(nonDealerPays + currentBonus * 100);
			}
		} else {
			if (w == winnerWind) {
				winds[w] = (nonDealerPays * 3) + (currentBonus * 300) + (riichiSticks * 1000);
			} else {
				winds[w] = -(nonDealerPays + (currentBonus * 100));
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

// Calculates the total base points from han + dora values
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