import Players from '../../api/Players';
import Constants from '../../api/Constants';

import './PlayerModal.html';

Template.PlayerModal.helpers({
    /**
     * Helper to retrieve statistics object for player
     * @returns The statistics object of a player
     */
    getPlayerInfo() {
	return Session.get("selectedStatistics");
    }
});
