import GameTypeUtils from '../../api/utils/GameTypeUtils';

import '../statistics/PlayerModal';
import './HongKongRanking';
import './JapaneseRanking';
import './Ranking.html';

Template.Ranking.helpers({
	getInfo(format, player) {
		player["elo"] = player["elo"].toFixed(3);
		return {
			...player,
			rank: this.rank ? ++this.rank : this.rank = 1
		};
	},

	getName(format) {
		return GameTypeUtils.formatName(format);
	},

	getPlayers(format, sort) {
		return GameTypeUtils.getPlayers(format, sort);
	}
});

Template.Ranking.events({
	'click .player': (event) => {
		event.preventDefault();
		let statistics = GameTypeUtils.getPlayer(Template.currentData()['format'], { _id: event.currentTarget.dataset["player"] });

		Session.set("selectedStatistics", statistics);
		$("#modal").modal('show');
	}
});
