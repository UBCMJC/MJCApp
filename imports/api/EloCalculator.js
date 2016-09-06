import { Players } from './players.js';

export class EloCalculator {
	constructor (n, exp, placing_adjustments, game) {
		this.n = n;
		this.exp = exp;
		this.placing_adjustments = placing_adjustments;
		this.game = game;
	}

	eloChange (player) {
		var index;
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

		console.log(100 * (adjustedScores[index] - expectedScores[index]));

		return this.rawExpectedScore(player);
	}

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

	rawExpectedScore (player) {
		return (1 / (1 + Math.pow(this.exp, (this.fieldElo(player) - this.getPlayerElo(player)) / this.n )));
	}

	adjustedScores() {
		var rawScoreSum = 0.0;
		var rawScores = [];
		var adjustments = [0, 0, 0, 0];
		var adjustedScores = [];

		var east_score = this.game.east_score;
		var south_score = this.game.south_score;
		var west_score = this.game.west_score;
		var north_score = this.game.north_score;

		rawScores.push(this.game.east_score);
		rawScores.push(this.game.south_score);
		rawScores.push(this.game.west_score);
		rawScores.push(this.game.north_score);

		for (index in this.placing_adjustments) {
			var nextBestScore = Math.max(east_score, south_score, west_score, north_score);

			switch (nextBestScore) {
			case east_score:
				adjustments[0] = this.placing_adjustments[index];
				east_score = Number.NEGATIVE_INFINITY;
				break;
			case south_score:
				adjustments[1] = this.placing_adjustments[index];
				south_score = Number.NEGATIVE_INFINITY;
				break;
			case west_score:
				adjustments[2] = this.placing_adjustments[index];
				west_score = Number.NEGATIVE_INFINITY;
				break;
			case north_score:
				adjustments[3] = this.placing_adjustments[index];
				north_score = Number.NEGATIVE_INFINITY;
				break;
			};
		}

		rawScoreSum = rawScores.reduce( (a,b) => a+b);

		for (index in rawScores) {
			adjustedScores.push((rawScores[index] + adjustments[index]) / rawScoreSum);
		}

		return adjustedScores;
	}

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

	getPlayerElo (player) {
		return Number(Players.findOne({name: player}).hongkong_elo);
	}
};