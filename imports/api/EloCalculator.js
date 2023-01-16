import Players from './Players';
import Constants from './Constants';
import GameTypeUtils from './utils/GameTypeUtils';

export default class EloCalculator {
    constructor (n, exp, placingAdjustments, game, gameType) {
        this.n = n;
        this.exp = exp;
        this.placingAdjustments = placingAdjustments;
        this.game = game;
        this.gameType = gameType;
    }

    // PUBLIC: Return ELO delta for a player
    eloChange (player) {
        let index, gamesPlayed;
        if (player == this.game.east_player)
            index = 0;
        else if (player == this.game.south_player)
            index = 1;
        else if (player == this.game.west_player)
            index = 2;
        else //if (player == this.game.north_player)
            index = 3;

        const expectedScores = this.expectedScores();
        const adjustedScores = this.adjustedScores();

        const playerElo = this.getPlayerElo(player);

        switch(this.gameType) {
        case Constants.GAME_TYPE.HONG_KONG:
            gamesPlayed = Number(Players.findOne({ hongKongLeagueName: player }).hongKongGamesPlayed);
            break;
        case Constants.GAME_TYPE.JAPANESE:
            gamesPlayed = Number(Players.findOne({ japaneseLeagueName: player }).japaneseGamesPlayed)
            break;
        case Constants.GAME_TYPE.UPPER_JAPANESE:
            gamesPlayed = Number(Players.findOne({ japaneseLeagueName: player }).upperJapaneseGamesPlayed)
            break;
        }

        /**
         * The k-value is a multiplier to add more weight initially when no games have been played
	 * 2 design reasons for k-value:
	 * 1. ELO calculation accuracy depends on players having close to their correct ELO
	 *    At the start of a player's season we should attempt matchmaking to place player in appropriate ELO
	 *    Issues with no k-value are:
         *      Incentive to farm "expected lower ELO" players and avoid "expected higher ELO players"
	 *      ELO changes at start of season are relatively random and do not accurately represent skill level
	 *   Some players may lose ELO at the beginning at a higher rate, but statistically this should 
	 *   primarly happen to players that are expected to lose ELO. Outliers will occur. Ignore their complaints.
	 * 2. Players may require many games to reach their "correct" ELO
	 *    In a perfect world, all players play infinite games for their ELO to stabilize around a "correct" value
	 *    This is impossible, and players will all play a different number of games
	 *    Issues with no k-value are:
	 *      Players who "should" be in playoffs but do not have the ability to play may not be able to climb
	 *  
         * First 10 games: -1 each game
         * Next 10 games: -2 each game
         * After: stops decreasing; levels at 70
         */
	// HACK: Remove this to appease the masses -> All above issues can be assumed to exist.
	// TODO: Add this back later
        // const k = 100 - Math.min(gamesPlayed, 10) - Math.min(Math.max(gamesPlayed - 10, 0), 10) * 2;
	    const k = 70;
        if (this.gameType == Constants.GAME_TYPE.UPPER_JAPANESE) {
            return 100 * (adjustedScores[index] - expectedScores[index]);
        } else {
            return (k * (adjustedScores[index] - expectedScores[index]));
        }
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
        for (let index in this.placingAdjustments) {
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

        for (let index in rawScores) {
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
        let criteria = {}
        switch (this.gameType) {
        case Constants.GAME_TYPE.HONG_KONG:
            criteria["hongKongLeagueName"] = player;
            break;
        case Constants.GAME_TYPE.JAPANESE:
            criteria["japaneseLeagueName"] = player;
            break;
        case Constants.GAME_TYPE.UPPER_JAPANESE:
            criteria["upperJapanese"] = true;
            break;
        }

        return Number(GameTypeUtils.getPlayer(this.gameType, criteria).elo);
    }
};
