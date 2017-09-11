import { Players } from './Players.js';

import { Constants } from './Constants.js';

export class EloCalculator {
	constructor (n, exp, placingAdjustments, game, gameType) {
		this.n = n;
		this.exp = exp;
		this.placingAdjustments = placingAdjustments;
		this.game = game;
		this.gameType = gameType;
	}

	// PUBLIC: Return ELO delta for a player
	eloChange (player) {
		var index, k = 100;
		if (player == this.game.east_player)
			index = 0;
		else if (player == this.game.south_player)
			index = 1;
		else if (player == this.game.west_player)
			index = 2;
		else //if (player == this.game.north_player)
			index = 3;

		var expectedScores = this.expectedScores();
		var adjustedScores = this.adjustedScores();

		var playerElo = this.getPlayerElo(player);

		/* Commenting out k at the request of Casper
			if (playerElo < 1300)
				k = 140;
			else if (playerElo < 1500)
				k = 120;
			else if (playerElo < 1600)
				k = 100;
			else if (playerElo < 1700)
				k = 80;
			else
				k = 60;
		*/

		return (k * (adjustedScores[index] - expectedScores[index]));
	}

	// Return expected scores for players based off table's ELO's
	expectedScores() {
		var rawExpectedScoreSum = 0.0;
		var rawExpectedScores = [];
		var expectedScores = [];

		rawExpectedScores.push(this.rawExpectedScore(this.game.east_player));
		rawExpectedScores.push(this.rawExpectedScore(this.game.south_player));
		rawExpectedScores.push(this.rawExpectedScore(this.game.west_player));
		rawExpectedScores.push(this.rawExpectedScore(this.game.north_player));

		rawExpectedScoreSum = rawExpectedScores.reduce( (a,b) => a+b);

		for (var index in rawExpectedScores) {
			expectedScores.push(rawExpectedScores[index] / rawExpectedScoreSum);
		}

		return expectedScores;
	}

	// Formula for expected score
	// see: https://github.com/Victorree/MahjongEloSystem/blob/master/src/com/company/model/EloCalculator.java
	rawExpectedScore (player) {
		return (1 / (1 + Math.pow(this.exp, (this.fieldElo(player) - this.getPlayerElo(player)) / this.n )));
	}

	// Return normalized, adjusted scores in [E,S,W,N] order
	adjustedScores() {
		var rawScoreSum = 0.0;
		var rawScores = [];
		var adjustments = [0, 0, 0, 0];
		var adjustedScores = [];

		var eastScore = this.game.east_score;
		var southScore = this.game.south_score;
		var westScore = this.game.west_score;
		var northScore = this.game.north_score;

		rawScores.push(this.game.east_score);
		rawScores.push(this.game.south_score);
		rawScores.push(this.game.west_score);
		rawScores.push(this.game.north_score);

		//Add score adjustment for 1st, 2nd, 3rd, 4th place
		//Is this too crude? Replace this if you have a better way
		for (index in this.placingAdjustments) {
			var nextBestScore = Math.max(eastScore, southScore, westScore, northScore);

			switch (nextBestScore) {
			case eastScore:
				adjustments[0] = this.placingAdjustments[index];
				eastScore = Number.NEGATIVE_INFINITY;
				break;
			case southScore:
				adjustments[1] = this.placingAdjustments[index];
				southScore = Number.NEGATIVE_INFINITY;
				break;
			case westScore:
				adjustments[2] = this.placingAdjustments[index];
				westScore = Number.NEGATIVE_INFINITY;
				break;
			case northScore:
				adjustments[3] = this.placingAdjustments[index];
				northScore = Number.NEGATIVE_INFINITY;
				break;
			};
		}

		rawScoreSum = rawScores.reduce( (a,b) => a+b);

		for (index in rawScores) {
			adjustedScores.push((rawScores[index] + adjustments[index]) / rawScoreSum);
		}

		return adjustedScores;
	}

	// Average ELO of all players except (player)
	fieldElo (player) {
		var fieldElo = 0.0;

		if (this.game.east_player != player)
			fieldElo += this.getPlayerElo(this.game.east_player);
		if (this.game.south_player != player)
			fieldElo += this.getPlayerElo(this.game.south_player);
		if (this.game.west_player != player)
			fieldElo += this.getPlayerElo(this.game.west_player);
		if (this.game.north_player != player)
			fieldElo += this.getPlayerElo(this.game.north_player);

		return fieldElo / 3;
	}

	// Return a player's ELO
	getPlayerElo (player) {
		switch (this.gameType) {
		case Constants.GAME_TYPE.HONG_KONG:
			return Number(Players.findOne({hongKongLeagueName: player}).hongKongElo);
		case Constants.GAME_TYPE.JAPANESE:
			return Number(Players.findOne({japaneseLeagueName: player}).japaneseElo);
		}
	}
};