import GameTypeUtils from '../../api/utils/GameTypeUtils';

import '../statistics/PlayerModal';
import './AmericanRanking';
import './HongKongRanking';
import './JapaneseRanking';
import './Ranking.html';

Template.Ranking.helpers({
	getName(format) {
		return GameTypeUtils.formatName(format);
	},

	getPlayers(format, sort) {
		return GameTypeUtils.getPlayers(format, sort).map((p, i) => ({
			...p,
			elo: p.elo.toFixed(3),
			rank: i + 1
		}));
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
