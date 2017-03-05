import Players from '../../api/Players';
import Constants from '../../api/Constants';

import './PlayerModal.html';

Template.PlayerModal.helpers({
    getPlayerInfo() {
        let player = Session.get("selectedStatistics");
        if (player) {
            let info = {};
            info.name = player.leagueName;
            info.elo = player.elo.toFixed(3);
            info.winRate = (player.handsWin / player.handsTotal * 100).toFixed(1);
            info.dealin = (player.handsLose / player.handsTotal * 100).toFixed(1);
            info.averagePosition = ((player.firstPlaceSum + 2 * player.secondPlaceSum + 3 * player.thirdPlaceSum + 4 * player.fourthPlaceSum) / player.gamesPlayed).toFixed(1);
            info.averageHandSize = player.handsWin ? (player.winPointsTotal / player.handsWin).toFixed(1) : 0;
            info.flyRate = (player.bankruptTotal / player.gamesPlayed * 100).toFixed(1);
            info.chombo = player.chomboTotal;

            if (player.riichiTotal !== undefined && player.winRiichiTotal !== undefined) {
                info.riichis = (player.riichiTotal / player.handsTotal * 100).toFixed(1);
                info.riichiWinRate = (player.winRiichiTotal / player.riichiTotal * 100).toFixed(1);
            }

            return info;
        }
    }
});