import { Template } from 'meteor/templating';
import Constants from '../../api/Constants';
import GameRecordUtils from '../../api/utils/GameRecordUtils';

import { Players } from '../../api/GameDatabases';

import './LiveHongKongGameModal.html';

Template.LiveHongKongGameModal.helpers({
    hands() {
        return Session.get("game_summary").all_hands;
    },

    get_east_player() {
        return Session.get("game_summary").east_player;
    },
    get_south_player() {
        return Session.get("game_summary").south_player;
    },
    get_west_player() {
        return Session.get("game_summary").west_player;
    },
    get_north_player() {
        return Session.get("game_summary").north_player;
    },

    // Show what a player's +/- is
    get_player_delta(direction) {
        let score = 0;
        switch (direction) {
            case Constants.EAST:
                score = Session.get("game_summary").east_score;
            case Constants.SOUTH:
                score = Session.get("game_summary").south_score;
            case Constants.WEST:
                score = Session.get("game_summary").west_score;
            case Constants.NORTH:
                score = Session.get("game_summary").north_score;
        }
        return (score - Constants.HKG_START_POINTS);
    },
    // Show what a player's current score is
    get_player_score(direction) {
        switch (direction) {
            case Constants.EAST:
                return Session.get("game_summary").east_score;
            case Constants.SOUTH:
                return Session.get("game_summary").south_score;
            case Constants.WEST:
                return Session.get("game_summary").west_score;
            case Constants.NORTH:
                return Session.get("game_summary").north_score;
        }
    },
    get_player_score_final(direction) {
        switch (direction) {
            case Constants.EAST:
                return Session.get("game_summary").east_score;
            case Constants.SOUTH:
                return Session.get("game_summary").south_score;
            case Constants.WEST:
                return Session.get("game_summary").west_score;
            case Constants.NORTH:
                return Session.get("game_summary").north_score;
        }
    },
    get_round() {
        return Session.get("game_summary").current_round;
    },
    get_bonus() {
        return Session.get("game_summary").current_bonus;
    },
    // Return a string of the round wind for Hong Kong style
    displayRoundWind(round) {
        return GameRecordUtils.displayRoundWind(round, Constants.GAME_TYPE.HONG_KONG);
    },
    // Return the current round number for Hong Kong style
    displayRoundNumber(round) {
        return GameRecordUtils.handNumberToRoundNumber(round,
                                                       Constants.GAME_TYPE.HONG_KONG);
    },
});

Template.hk_render_hand.helpers({
    is_dealin(hand_type) {
        return hand_type == Constants.DEAL_IN;
    },
    is_selfdraw(hand_type) {
        return hand_type == Constants.SELF_DRAW;
    },
    is_nowin(hand_type) {
        return hand_type == Constants.NO_WIN;
    },
    is_restart(hand_type) {
        return hand_type == Constants.RESTART;
    },
    is_mistake(hand_type) {
        return hand_type == Constants.MISTAKE;
    },
    // Return a string of the round wind for Hong Kong style
    displayRoundWind(round) {
        return GameRecordUtils.displayRoundWind(round, Constants.GAME_TYPE.HONG_KONG);
    },
    // Return the current round number for Hong Kong style
    displayRoundNumber(round) {
        return GameRecordUtils.handNumberToRoundNumber(round,
                                                       Constants.GAME_TYPE.HONG_KONG);
    },
});
