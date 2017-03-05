import Constants from '../../api/Constants';
import './HongKongRanking.html';

Template.HongKongRanking.helpers({
    getContext() {
        return {
            format: Constants.GAME_TYPE.HONG_KONG,
            hongKongElo: -1
        };
    }
})
