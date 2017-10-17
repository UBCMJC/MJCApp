import { Constants } from './Constants';
import { EloCalculator } from '../api/EloCalculator.js';
import { JapaneseHands } from './GameDatabases.js';
import { Players } from './Players.js';

export let HistoryUtils = {
    regenerateJapaneseElo() {
        let allGames = JapaneseHands.find({}, { sort: { "timestamp": 1 }}).fetch();
        Players.update({}, { $set: { japaneseElo: 1500 } }, { multi: true });

        let allPlayers = {};

        Players.find({}, { fields: { _id: 1, japaneseLeagueName: 1 }}).fetch().forEach((p) => {
            allPlayers[p.japaneseLeagueName] = {
                id: p._id,
                elo: 1500
            };
        });

        for (let game of allGames) {
            let eastPlayer = game["east_player"];
            let southPlayer = game["south_player"];
            let westPlayer = game["west_player"];
            let northPlayer = game["north_player"];

            let calculator = new EloCalculator(2000, 5, [15000, 0, -5000, -10000], game, Constants.GAME_TYPE.JAPANESE);
            let eastEloDelta = calculator.eloChange(eastPlayer);
            let southEloDelta = calculator.eloChange(southPlayer);
            let westEloDelta = calculator.eloChange(westPlayer);
            let northEloDelta = calculator.eloChange(northPlayer);

            allPlayers[eastPlayer].elo += eastEloDelta;
            allPlayers[southPlayer].elo += southEloDelta;
            allPlayers[westPlayer].elo += westEloDelta;
            allPlayers[northPlayer].elo += northEloDelta;
        }

        for (let index in allPlayers) {
            let player = allPlayers[index];
            Players.update({ _id: player.id }, { $set: {
                japaneseElo: player.elo
            }});
        }
    }
};
