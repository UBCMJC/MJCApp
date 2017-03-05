import Constants from '../Constants';
import Players from '../Players';

export default {
    formatName(format) {
        switch (format) {
        case Constants.GAME_TYPE.JAPANESE:
            return "Japanese";
        case Constants.GAME_TYPE.HONG_KONG:
            return "Hong Kong";
        default:
            logInvalidFormat(format);
            return "Unknown";
        }
    },

    getPlayer(format, criteria) {
        return standardizePlayerStatistics(format, Players.findOne(criteria));
    },

    getPlayers(format, sort) {
        let hasPlayedGames = {};
        switch (format) {
        case Constants.GAME_TYPE.JAPANESE:
            hasPlayedGames["japaneseGamesPlayed"] = { $gt: 0 };
            break;
        case Constants.GAME_TYPE.HONG_KONG:
            hasPlayedGames["hongKongGamesPlayed"] = { $gt: 0 };
            break;
        default:
            logInvalidFormat(format);
        }

        return Players.find(hasPlayedGames, { sort }).map((player) => standardizePlayerStatistics(format, player));
    }
}

function standardizePlayerStatistics(format, player) {
    let formatPlayer = {};
    switch (format) {
    case Constants.GAME_TYPE.JAPANESE:
        formatPlayer["leagueName"] = player["japaneseLeagueName"];
        formatPlayer["elo"] = player["japaneseElo"];
        formatPlayer["gamesPlayed"] = player["japaneseGamesPlayed"];
        formatPlayer["handsWin"] = player["japaneseHandsWin"];
        formatPlayer["handsLose"] = player["japaneseHandsLose"];
        formatPlayer["handsTotal"] = player["japaneseHandsTotal"];
        formatPlayer["winPointsTotal"] = player["japaneseWinPointsTotal"];
        formatPlayer["winDoraTotal"] = player["japaneseWinDoraTotal"];
        formatPlayer["riichiTotal"] = player["japaneseRiichiTotal"];
        formatPlayer["winRiichiTotal"] = player["japaneseWinRiichiTotal"];
        formatPlayer["chomboTotal"] = player["japaneseChomboTotal"];
        formatPlayer["bankruptTotal"] = player["japaneseBankruptTotal"];
        formatPlayer["firstPlaceSum"] = player["japaneseFirstPlaceSum"];
        formatPlayer["secondPlaceSum"] = player["japaneseSecondPlaceSum"];
        formatPlayer["thirdPlaceSum"] = player["japaneseThirdPlaceSum"];
        formatPlayer["fourthPlaceSum"] = player["japaneseFourthPlaceSum"];
        break;

    case Constants.GAME_TYPE.HONG_KONG:
        formatPlayer["leagueName"] = player["hongKongLeagueName"];
        formatPlayer["elo"] = player["hongKongElo"];
        formatPlayer["gamesPlayed"] = player["hongKongGamesPlayed"];
        formatPlayer["handsWin"] = player["hongKongHandsWin"];
        formatPlayer["handsLose"] = player["hongKongHandsLose"];
        formatPlayer["handsTotal"] = player["hongKongHandsTotal"];
        formatPlayer["winPointsTotal"] = player["hongKongWinPointsTotal"];
        formatPlayer["chomboTotal"] = player["hongKongChomboTotal"];
        formatPlayer["bankruptTotal"] = player["hongKongBankruptTotal"];
        formatPlayer["firstPlaceSum"] = player["hongKongFirstPlaceSum"];
        formatPlayer["secondPlaceSum"] = player["hongKongSecondPlaceSum"];
        formatPlayer["thirdPlaceSum"] = player["hongKongThirdPlaceSum"];
        formatPlayer["fourthPlaceSum"] = player["hongKongFourthPlaceSum"];
        break;

    default:
        logInvalidFormat(format);
        formatPlayer = player;
    }

    formatPlayer["id"] = player["_id"];
    return formatPlayer;
}

function logInvalidFormat(format) { console.log("Format '" + format + "' is invalid") }