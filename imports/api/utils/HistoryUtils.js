import { JapaneseHands } from '../GameDatabases';
import { HongKongHands } from '../GameDatabases';

import Constants from '../Constants';
import EloCalculator from '../EloCalculator';
import Players from '../Players'

export default {
	regenerateJapaneseEloStat() {
		// Client-side hack to circumvent security
		for (let player of Players.find({}).fetch()) {
			console.log(player.japaneseLeagueName)
				Players.update({ _id: player._id}, { $set: { japaneseElo: 1500, japaneseGamesPlayed: 0 } });
		}

		let allPlayersElo = this.calculateAllJapaneseElo();

		for (let index in allPlayersElo) {
			let player = allPlayersElo[index];
			Players.update({ _id: player._id }, { $set: { japaneseElo: player.elo, japaneseGamesPlayed: player.games }});
		}
	},

	regenerateHongKongEloStat() {
		// Client-side hack to circumvent security
		for (let player of Players.find({}).fetch()) {
			Players.update({ _id: player._id}, { $set: { hongKongElo: 1500, hongKongGamesPlayed: 0 } });
		}

		let allPlayersElo = this.calculateAllHongKongElo();

		for (let index in allPlayersElo) {
			let player = allPlayersElo[index];
			Players.update({ _id: player._id }, { $set: { hongKongElo: player.elo, hongKongGamesPLayed: player.games }});
		}
	},

	calculateAllJapaneseElo(calculationTime = -1) {
		return this.calculateAllElo(Constants.GAME_TYPE.JAPANESE, calculationTime);
	},

	calculateAllHongKongElo(calculationTime = -1) {
		return this.calculateAllElo(Constants.GAME_TYPE.HONG_KONG, calculationTime);
	},

	calculateAllElo(gameType, calculationTime = -1) {
		let allPlayers = {};
		let allGames = {};
		let positionBonus;

		console.log(gameType);

		switch (gameType) {
		case Constants.GAME_TYPE.JAPANESE:
			positionBonus = Constants.JPN_SCORE_ADJUSTMENT;
			if (calculationTime >= 0) {
				allGames = JapaneseHands.find({ "timestamp" : { $lt: calculationTime}}, { sort: { "timestamp" : 1}}).fetch();
			} else {
				allGames = JapaneseHands.find({}, { sort : { "timestamp": 1 }}).fetch();
			}
			Players.find({}, { fields: { _id: 1, japaneseLeagueName: 1}}).fetch().forEach(
				(p) => {
					allPlayers[p.japaneseLeagueName] = {
					_id: p._id,
					elo: 1500,
					games: 0
					};
				});
			break;
		case Constants.GAME_TYPE.HONG_KONG:
			positionBonus = Constants.HKG_SCORE_ADJUSTMENT;
			if (calculationTime >= 0) {
				allGames = HongKongHands.find({ "timestamp" : { $lt: calculationTime}}, { sort: { "timestamp" : 1}}).fetch();
			} else {
				allGames = HongKongHands.find({}, { sort : { "timestamp": 1 }}).fetch();
			}

			Players.find({}, { fields: { _id: 1, hongKongLeagueName: 1}}).fetch().forEach(
				(p) => {
					allPlayers[p.hongKongLeagueName] = {
					_id: p._id,
					elo: 1500,
					games: 0
					};
				});
			break;
		}

		for (let game of allGames) {
			let eastPlayer = game["east_player"];
			let southPlayer = game["south_player"];
			let westPlayer = game["west_player"];
			let northPlayer = game["north_player"];



			let eloCalculator = new EloCalculator(Constants.ELO_CALCULATOR_N,
							      Constants.ELO_CALCULATOR_EXP,
							      positionBonus,
							      game,
							      gameType);

			let eastEloDelta = eloCalculator.eloChange(eastPlayer);
			let southEloDelta = eloCalculator.eloChange(southPlayer);
			let westEloDelta = eloCalculator.eloChange(westPlayer);
			let northEloDelta = eloCalculator.eloChange(northPlayer);

			allPlayers[eastPlayer].elo += eastEloDelta;
			allPlayers[southPlayer].elo += southEloDelta;
			allPlayers[westPlayer].elo += westEloDelta;
			allPlayers[northPlayer].elo += northEloDelta;

			allPlayers[eastPlayer].games++;
			allPlayers[southPlayer].games++;
			allPlayers[westPlayer].games++;
			allPlayers[northPlayer].games++;
		}
		return allPlayers;
	},


};
