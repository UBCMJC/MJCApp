import GameTypeUtils from '../../api/utils/GameTypeUtils';
import Constants from '../../api/Constants';

import '../statistics/PlayerModal';
import './HongKongRanking';
import './JapaneseRanking';
import './Ranking.html';

Template.Ranking.onCreated(
    /**
     * Setup "constructor" for Ranking page, ensure that default stats are shown
     */
    function() {
        Session.set("sortStatistic", "elo");
        Session.set("additionalStatistic", "gamesPlayed");
    }
);

Template.Ranking.helpers({
    getName(format) {
        return GameTypeUtils.formatName(format);
    },

    /**
     * Return the list of valid players, ranked by ELO and sorted by orderSort
     * @param[in] format The Constants.GAME_TYPE game format
     * @param[in] rankingSort The order to rank players by (currently always ELO)
     * @param[in] orderSort The order to sort players by
     * @returns A list of players with statistics
     */
    getOrderedPlayers(format, rankingSort, orderSort) {
        return GameTypeUtils.getPlayers(format, rankingSort).map((p, i) => ({
            ...p,
            elo: p.elo.toFixed(3),
            rank: i + 1
        })).sort(orderSort.hash.orderSort);
    },

    /**
     * List generator for ranking page statistics options
     * @param[in] format The Constants.GAME_TYPE format
     * @param[in] exclusions List of statistics to exclude by value (Ignore format!)
     * @returns an object of formatted statistics keyed with statistics
     */
    getRankingStatistics(format, exclusions) {
        let defaultStatisticsList = [
            {value: "elo", displayText: "ELO"},
            {value: "gamesPlayed", displayText: "Games"},
            {value: "handWinRate", displayText: "Hand Win %"},
            {value: "dealinRate", displayText: "Deal-in %"},
            {value: "averageHandSize", displayText: "Avg Hand Size"},
            {value: "averagePosition", displayText: "Avg Position"},
            {value: "flyRate", displayText: "Bankrupt %"},
            {value: "chomboTotal", displayText: "Chombos"}
        ];
        const japaneseStatisticsList = [
            {value: "averageHandDora", displayText: "Avg Hand Dora"},
            {value: "riichiRate", displayText: "Riichi %"},
            {value: "riichiWinRate", displayText: "Riichi Win %"}
        ];

	// Filter out excluded statistics and non-format statistics
	return [...defaultStatisticsList, ...japaneseStatisticsList].filter(
	    (statistic) =>
		!exclusions.find((exclusion) => exclusion.value === statistic.value) &&
	        !(japaneseStatisticsList.includes(statistic) && format !== Constants.GAME_TYPE.JAPANESE));
    },

    /**
     * Get statistic for a player, either sort or additional
     * @returns the selected statistic for a player
     */
    getSortStatistic(player) {
        return player[Session.get("sortStatistic")];
    },
    getAdditionalStatistic(player) {
        return player[Session.get("additionalStatistic")];
    },

    /**
     * Get formatted unit for a statistic if it has one
     * @returns String of formatted unit or empty string
     */
    getSortStatUnit() {
        return getStatisticUnit(Session.get("sortStatistic"));
    },
    getAdditionalStatUnit() {
        return getStatisticUnit(Session.get("additionalStatistic"));
    },

    /**
     * Exclusion lists for statistics options. Allows for manual entries
     * @returns a list of statistics to exclude
     */
    sortRankingExclusion() {
        return [{value: "elo"}];
    },
    additionalRankingExclusion() {
        return [{value: "gamesPlayed"}];
    },

    /**
     * Lambda generator for Array.sort() on player statistics
     * @param[in] a See Array.sort, param a
     * @param[in] b See Array.sort, param b
     * @returns A sorting lambda
     */
    orderSort(a, b) {
        return ((a, b) => {
            let sortBy = Session.get("sortStatistic");
            let sortOrder = (["dealinRate", "averagePosition"].includes(sortBy)) ? 1 : -1;
            let first = Number(a[sortBy]);
            let second = Number(b[sortBy]);
            return (first > second) ? sortOrder : ((second > first) ? -sortOrder : 0)
        });
    }
});

Template.Ranking.events({
    'click .player': (event) => {
        event.preventDefault();
        let statistics = GameTypeUtils.getPlayer(Template.currentData()['format'], { _id: event.currentTarget.dataset["player"] });

        Session.set("selectedStatistics", statistics);
        $("#modal").modal('show');
    },

    /**
     * Event handler for modifying ranking sort statistic
     * @param[in] event The event to handle
     */
    'change select[name="sortStatistic"]'(event) {
        Session.set("sortStatistic", event.target.value);
    },

    /**
     * Event handler for modifying ranking additional statistic
     * @param[in] event The event to handle
     */
    'change select[name="additionalStatistic"]'(event) {
        Session.set("additionalStatistic", event.target.value);
    }
});

function getStatisticUnit(statistic) {
    return ["handWinRate",
	    "dealinRate",
	    "flyRate",
	    "riichiRate",
	    "riichiWinRate"].includes(statistic) ? " %" : "";
}
