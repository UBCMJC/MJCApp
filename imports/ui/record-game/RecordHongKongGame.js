//Databases
import Players from '../../api/Players';
import { HongKongHands } from '../../api/GameDatabases';

import Constants from '../../api/Constants';
import EloCalculator from '../../api/EloCalculator';
import GameRecordUtils from '../../api/utils/GameRecordUtils';

import './RecordHongKongGame.html';

Template.RecordHongKongGame.onCreated( function() {
    this.hand_type = new ReactiveVar( Constants.HKG_DEAL_IN );
    this.hands = new ReactiveArray();

    GameRecordUtils.resetGameValues(Constants.HKG_START_POINTS);
});

Template.RecordHongKongGame.helpers({
    hand_type() {
        return Template.instance().hand_type.get();
    },
    players() {
        return Players.find({}, {sort: { hongKongLeagueName: 1}});
    },
    hands() {
        return Template.instance().hands.get();
    },
    get_player_delta(direction) {
        return (GameRecordUtils.getDirectionScore(direction) - Constants.HKG_START_POINTS);
    },
    get_player_score(direction) {
        return GameRecordUtils.getDirectionScore(direction);
    },
    get_player_score_final(direction) {
        return GameRecordUtils.getDirectionScore(direction);
    },
    // Show what a player's Elo change will look like if game is ended now
    get_expected_elo_change(direction) {

        let eastPlayer  = Session.get("current_east");
        let southPlayer = Session.get("current_south");
        let westPlayer  = Session.get("current_west");
        let northPlayer = Session.get("current_north");

        if (eastPlayer  == Constants.DEFAULT_EAST ||
            southPlayer == Constants.DEFAULT_SOUTH ||
            westPlayer  == Constants.DEFAULT_WEST ||
            northPlayer == Constants.DEFAULT_NORTH) {
            return "N/A";
        }

        let game = {
            timestamp: Date.now(),
            east_player: eastPlayer,
            south_player: southPlayer,
            west_player: westPlayer,
            north_player: northPlayer,
            east_score: (Number(Session.get("east_score"))),
            south_score: (Number(Session.get("south_score"))),
            west_score: (Number(Session.get("west_score"))),
            north_score: (Number(Session.get("north_score"))),
            all_hands: Template.instance().hands.get(),
        };

        let hkEloCalculator = new EloCalculator(Constants.ELO_CALCULATOR_N,
                                                Constants.ELO_CALCULATOR_EXP,
                                                Constants.HKG_SCORE_ADJUSTMENT,
                                                game,
                                                Constants.GAME_TYPE.HONG_KONG);

        switch (direction) {
        case Constants.EAST:  return hkEloCalculator.eloChange(eastPlayer).toFixed(2);
        case Constants.SOUTH: return hkEloCalculator.eloChange(southPlayer).toFixed(2);
        case Constants.WEST:  return hkEloCalculator.eloChange(westPlayer).toFixed(2);
        case Constants.NORTH: return hkEloCalculator.eloChange(northPlayer).toFixed(2);
        };
    },
    get_hk_elo(player) {
        switch (player) {
        case Constants.DEFAULT_EAST:
        case Constants.DEFAULT_SOUTH:
        case Constants.DEFAULT_WEST:
        case Constants.DEFAULT_NORTH:
            return "?";
        default:
            return Players.findOne({hongKongLeagueName: player}).hongKongElo.toFixed(2);
        };
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

Template.render_hand.helpers({
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

// Helper for point selection dropdown
Template.points.helpers({
    /**
     * Return an Array of valid Hong Kong mahjong hand point values
     *
     * @return {Array} An Array of valid point values
     */
    get possiblePoints() {
        return Array.from({ length: Constants.HKG_MAX_HAND_SIZE - 2 }).map((_,i) => ({ point: i + 3 }));
    }
});

Template.RecordHongKongGame.events({
    //Selecting who the east player is
    'change select[name="east_player"]'(event) {
        Session.set("current_east", event.target.value);
    },
    //Selecting who the south player is
    'change select[name="south_player"]'(event) {
        Session.set("current_south", event.target.value);
    },
    //Selecting who the west player is
    'change select[name="west_player"]'(event) {
        Session.set("current_west", event.target.value);
    },
    //Selecting who the north player is
    'change select[name="north_player"]'(event) {
        Session.set("current_north", event.target.value);
    },
    //Selecting who the winner is for a dealin or tsumo
    'click .winner'(event) {
        if ( !$( event.target ).hasClass( "disabled" )) {
            if ( $( event.target ).hasClass( "active" )) {
                $( event.target ).removeClass( "active" );
                $( ".winner_buttons button" ).not( event.target ).removeClass( "disabled" );
                Session.set("round_winner", Constants.NO_PERSON);
            } else {
                $( event.target ).addClass( "active" );
                $( ".winner_buttons button" ).not( event.target ).addClass( "disabled" );
                Session.set("round_winner", event.target.innerHTML);
            }
        }
    },
    //Selecting who the loser is for a dealin
    'click .loser'(event) {
        if ( !$( event.target ).hasClass( "disabled" )) {
            if ( $( event.target ).hasClass( "active" )) {
                $( event.target ).removeClass( "active" );
                $( ".loser_buttons button" ).not( event.target ).removeClass( "disabled" );
                Session.set("round_loser", Constants.NO_PERSON);
            } else {
                $( event.target ).addClass( "active" );
                $( ".loser_buttons button" ).not( event.target ).addClass( "disabled" );
                Session.set("round_loser", event.target.innerHTML);
            }
        }
    },
    //Selecting who is under pao
    'click .pao'(event) {
        if ( !$( event.target ).hasClass( "disabled" )) {
            if ( $( event.target ).hasClass( "active" )) {
                $( event.target ).removeClass( "active" );
                $( ".pao_buttons button" ).not( event.target ).removeClass( "disabled" );
                Session.set("round_pao_player", Constants.NO_PERSON);
            } else {
                $( event.target ).addClass( "active" );
                $( ".pao_buttons button" ).not( event.target ).addClass( "disabled" );
                Session.set("round_pao_player", event.target.innerHTML);
            }
        }
    },

    'click .submit_names_button'(event, template) {
        if ( !$( event.target ).hasClass( "disabled")) {
            if (GameRecordUtils.allPlayersSelected()) {
                document.getElementById("hk_buttons").style.display = "block";
                document.getElementById("hk_rest").style.display = "block";
                document.getElementById("hk_dynamic").style.display = "block";
                document.getElementById("hk_players").style.display = "none";
                document.getElementById("hk_submit_button").style.display = "none";
            } else {
                window.alert("please enter all 4 player names!");
            }
        }

        var position;
        var east_player = Session.get("current_east");
        var south_player= Session.get("current_south");
        var west_player = Session.get("current_west");
        var north_player= Session.get("current_north");

        var game = {
                timestamp: Date.now(),
                east_player: east_player,
                south_player: south_player,
                west_player: west_player,
                north_player: north_player,
                east_score: Constants.JPN_START_POINTS,
                south_score: Constants.JPN_START_POINTS,
                west_score: Constants.JPN_START_POINTS,
                north_score: Constants.JPN_START_POINTS,
                current_round: 1,
                current_bonus: 0,
                all_hands: [],
                complete: 0,
        };
        Session.set("game_id", HongKongHands.insert(game));
        localStorage.setItem("game_id", Session.get("game_id"));
    },
    //Submission of a hand
    'click .submit_hand_button'(event, template) {

        if ( !$( event.target ).hasClass( "disabled")) {
            var pnt = Number(Session.get("current_points"));

            //Do nothing if we don't have players yet
            if (GameRecordUtils.allPlayersSelected() ) {
                switch(template.hand_type.get()) {
                case Constants.HKG_DEAL_IN:
                    if (Session.get("round_winner") != Constants.NO_PERSON &&
                        Session.get("round_loser") != Constants.NO_PERSON &&
                        Session.get("round_winner") != Session.get("round_loser")) {
                        if (Session.get("current_points") != 0) {
                            push_dealin_hand(template);
                            resetRoundStats();
                            $( ".delete_hand_button" ).removeClass( "disabled" );
                        } else {
                            window.alert("Invalid points entry!");
                        }
                    } else {
                        window.alert("You need to fill out who won and who dealt in!");
                    }
                    break;

                case Constants.HKG_SELF_DRAW:
                    if (Session.get("round_winner") != Constants.NO_PERSON) {
                        if (Session.get("current_points") != 0) {
                            push_selfdraw_hand(template);
                            resetRoundStats();
                            $( ".delete_hand_button" ).removeClass( "disabled" );
                        } else {
                            window.alert("Invalid points entry!");
                        }
                    } else {
                        window.alert("You need to fill out who self drew!");
                    }
                    break;

                case Constants.HKG_NO_WIN:
                    push_nowin_hand(template);
                    resetRoundStats();
                    $( ".delete_hand_button" ).removeClass( "disabled" );
                    break;

                case Constants.HKG_MISTAKE:
                    if (Session.get("round_loser") != Constants.NO_PERSON) {
                        push_mistake_hand(template);
                        resetRoundStats();
                        $( ".delete_hand_button" ).removeClass( "disabled" );
                    }

                    else
                        window.alert("You need to fill out who made the mistake!");
                    break;

                case Constants.HKG_PAO:
                    if (Session.get("round_winner") != Constants.NO_PERSON &&
                        Session.get("round_pao_player") != Constants.NO_PERSON &&
                        Session.get("round_winner")     != Session.get("round_pao_player")) {
                        if (Session.get("current_points") != 0) {
                            push_pao_hand(template);
                            resetRoundStats();
                            $( ".delete_hand_button" ).removeClass( "disabled" );
                        } else {
                            window.alert("Invalid points entry!");
                        }
                    } else {
                        window.alert("You need to fill out who won, who dealt in, and who has pao penalty!");
                    }
                    break;

                default:
                    console.log("Something went wrong; Received hand type: " + template.hand_type);
                    break;
                };
            } else {
                window.alert("You need to fill out the player information!");
            }

            let current_hand = template.hands.get()[template.hands.get().length - 1];
            HongKongHands.update({_id: Session.get("game_id")},
                        {$set:{all_hands: template.hands.get(),
                               current_round: Session.get("current_round"),
                               current_bonus: Session.get("current_bonus")},
                        $inc: {east_score: current_hand.eastDelta, south_score: current_hand.southDelta,
                               west_score: current_hand.westDelta, north_score: current_hand.northDelta}});

            if (GameRecordUtils.someoneBankrupt() ||
                Session.get("current_round") > 16)
            {
                $( event.target ).addClass( "disabled");
                $( ".submit_game_button" ).removeClass( "disabled" );
            }
        }

    },
    //Remove the last submitted hand
    'click .delete_hand_button'(event, template) {
        if ( !$( event.target ).hasClass( "disabled" )) {
            var r = confirm("Are you sure you want to delete the last hand?");
            if (r == true) {
                var del_hand = Template.instance().hands.pop();

                Session.set("east_score", Number(Session.get("east_score")) - Number(del_hand.eastDelta));
                Session.set("south_score", Number(Session.get("south_score")) - Number(del_hand.southDelta));
                Session.set("west_score", Number(Session.get("west_score")) - Number(del_hand.westDelta));
                Session.set("north_score", Number(Session.get("north_score")) - Number(del_hand.northDelta));
                Session.set("current_bonus", del_hand.bonus);
                Session.set("current_round", del_hand.round);

                // Rollback chombo stat
                if (del_hand.handType == Constants.MISTAKE)
                    GameRecordUtils.rollbackChomboStat(del_hand);

                // Rollback hand stats for wins/losses
                if (del_hand.handType == Constants.DEAL_IN || del_hand.handType == Constants.SELF_DRAW) {
                    // win stat
                    GameRecordUtils.rollbackHandWinStat(del_hand);

                    // points stat
                    GameRecordUtils.rollbackTotalPointsStat(del_hand);

                    // loss stat -> may occur when pao selfdraw
                    GameRecordUtils.rollbackHandDealinStat(del_hand);
                }

                $( ".submit_hand_button" ).removeClass( "disabled" );
                $( ".submit_game_button" ).addClass( "disabled" );
                if (Template.instance().hands.get().length === 0) {
                    $( ".delete_hand_button" ).addClass( "disabled" );
                }
            }
        }
    },
    //Delete a game from the database

    'click .delete_game_button'(event, template) {
        if ( !$(event.target ).hasClass( "disabled" )) {
            var r = confirm("Are you sure you want to delete this game?");
            if (r == true) {
                localStorage.clear();

                //deletes game from database
                JapaneseHands.remove({_id: Session.get("game_id")});

                //resets page UI
                document.getElementById("jpn_buttons").style.display = "none";
                document.getElementById("jpn_rest").style.display = "none";
                document.getElementById("jpn_dynamic").style.display = "none";
                document.getElementById("jpn_players").style.display = "block";
                document.getElementById("submit_button").style.display = "block";


                //Deletes all hands to reset to empty game
                while (template.hands.pop()) {}

                Session.set("east_score", Constants.JPN_START_POINTS);
                Session.set("south_score", Constants.JPN_START_POINTS);
                Session.set("west_score", Constants.JPN_START_POINTS);
                Session.set("north_score", Constants.JPN_START_POINTS);

                Session.set("current_round", 1);
                Session.set("current_bonus", 0);

                Session.set("free_riichi_sticks", 0);

                Session.set("eastPlayerRiichisWon", 0);
                Session.set("southPlayerRiichisWon", 0);
                Session.set("westPlayerRiichisWon", 0);
                Session.set("northPlayerRiichisWon", 0);

                Session.set("eastMistakeTotal", 0);
                Session.set("southMistakeTotal", 0);
                Session.set("westMistakeTotal", 0);
                Session.set("northMistakeTotal", 0);

                Session.set("eastPlayerWins", 0);
                Session.set("southPlayerWins", 0);
                Session.set("westPlayerWins", 0);
                Session.set("northPlayerWins", 0);

                Session.set("eastPlayerPointsWon", 0);
                Session.set("southPlayerPointsWon", 0);
                Session.set("westPlayerPointsWon", 0);
                Session.set("northPlayerPointsWon", 0);

                Session.set("eastPlayerDoraSum", 0);
                Session.set("southPlayerDoraSum", 0);
                Session.set("westPlayerDoraSum", 0);
                Session.set("northPlayerDoraSum", 0);

                Session.set("eastPlayerLosses", 0);
                Session.set("southPlayerLosses", 0);
                Session.set("westPlayerLosses", 0);
                Session.set("northPlayerLosses", 0);

                resetRoundStats();

                $( ".submit_hand_button" ).removeClass( "disabled" );
                $( ".submit_game_button" ).addClass( "disabled" );
                $( ".delete_hand_button" ).addClass( "disabled" );
            }

        }
    },

    //Submit a game to the database
    'click .submit_game_button'(event, template) {
        var r = confirm("Are you sure you want to submit this game?");
        if (r == true) {
            save_game_to_database(template.hands.get());

            //Deletes all hands
            while (template.hands.pop()) {}
            Session.set("east_score", Constants.HKG_START_POINTS);
            Session.set("south_score", Constants.HKG_START_POINTS);
            Session.set("west_score", Constants.HKG_START_POINTS);
            Session.set("north_score", Constants.HKG_START_POINTS);

            Session.set("current_round", 1);
            Session.set("current_bonus", 0);

            Session.set("eastMistakeTotal", 0);
            Session.set("southMistakeTotal", 0);
            Session.set("westMistakeTotal", 0);
            Session.set("northMistakeTotal", 0);

            Session.set("eastPlayerWins", 0);
            Session.set("southPlayerWins", 0);
            Session.set("westPlayerWins", 0);
            Session.set("northPlayerWins", 0);

            Session.set("eastPlayerPointsWon", 0);
            Session.set("southPlayerPointsWon", 0);
            Session.set("westPlayerPointsWon", 0);
            Session.set("northPlayerPointsWon", 0);

            Session.set("eastPlayerLosses", 0);
            Session.set("southPlayerLosses", 0);
            Session.set("westPlayerLosses", 0);
            Session.set("northPlayerLosses", 0);

            $( ".submit_hand_button" ).removeClass( "disabled" );
            $( ".submit_game_button" ).addClass( "disabled" );
            $( ".delete_hand_button" ).addClass( "disabled" );
        }
    },
    //Toggle between different round types
    'click .nav-pills li'( event, template ) {
        var hand_type = $( event.target ).closest( "li" );

        hand_type.addClass( "active" );
        $( ".nav-pills li" ).not( hand_type ).removeClass( "active" );

        template.hand_type.set( hand_type.data( "template" ) );
    },
});

function save_game_to_database(hands_array) {

    var east_player = Session.get("current_east");
    var south_player= Session.get("current_south");
    var west_player = Session.get("current_west");
    var north_player= Session.get("current_north");

    var game = {
        timestamp: Date.now(),
        east_player: east_player,
        south_player: south_player,
        west_player: west_player,
        north_player: north_player,
        east_score: (Number(Session.get("east_score"))),
        south_score: (Number(Session.get("south_score"))),
        west_score: (Number(Session.get("west_score"))),
        north_score: (Number(Session.get("north_score"))),
        all_hands: hands_array,
    };

    HongKongHands.update({_id: Session.get("game_id")}, {$set:{complete: 1}});


    var hk_elo_calculator = new EloCalculator(Constants.ELO_CALCULATOR_N,
                                              Constants.ELO_CALCULATOR_EXP,
                                              Constants.HKG_SCORE_ADJUSTMENT,
                                              game,
                                              Constants.GAME_TYPE.HONG_KONG);
    var east_elo_delta = hk_elo_calculator.eloChange(east_player);
    var south_elo_delta = hk_elo_calculator.eloChange(south_player);
    var west_elo_delta = hk_elo_calculator.eloChange(west_player);
    var north_elo_delta = hk_elo_calculator.eloChange(north_player);

    var east_id = Players.findOne({hongKongLeagueName: east_player}, {})._id;
    var south_id = Players.findOne({hongKongLeagueName: south_player}, {})._id;
    var west_id = Players.findOne({hongKongLeagueName: west_player}, {})._id;
    var north_id = Players.findOne({hongKongLeagueName: north_player}, {})._id;

    if (east_elo_delta != NaN && south_elo_delta != NaN && west_elo_delta != NaN && north_elo_delta != NaN) {
        // Save ELO
        Players.update({_id: east_id}, {$inc: {hongKongElo: east_elo_delta}});
        Players.update({_id: south_id}, {$inc: {hongKongElo: south_elo_delta}});
        Players.update({_id: west_id}, {$inc: {hongKongElo: west_elo_delta}});
        Players.update({_id: north_id}, {$inc: {hongKongElo: north_elo_delta}});

        // Save number of games
        Players.update({_id: east_id}, {$inc: {hongKongGamesPlayed: 1}});
        Players.update({_id: south_id}, {$inc: {hongKongGamesPlayed: 1}});
        Players.update({_id: west_id}, {$inc: {hongKongGamesPlayed: 1}});
        Players.update({_id: north_id}, {$inc: {hongKongGamesPlayed: 1}});

        // Save bankruptcy counts
        if (Number(Session.get("east_score")) < 0)
            Players.update({_id: east_id}, {$inc: {hongKongBankruptTotal: 1}});
        if (Number(Session.get("south_score")) < 0)
            Players.update({_id: south_id}, {$inc: {hongKongBankruptTotal: 1}});
        if (Number(Session.get("west_score")) < 0)
            Players.update({_id: west_id}, {$inc: {hongKongBankruptTotal: 1}});
        if (Number(Session.get("north_score")) < 0)
            Players.update({_id: north_id}, {$inc: {hongKongBankruptTotal: 1}});

        // Save chombo counts
        Players.update({_id: east_id}, {$inc: {hongKongChomboTotal: Number(Session.get("eastMistakeTotal"))}});
        Players.update({_id: south_id}, {$inc: {hongKongChomboTotal: Number(Session.get("southMistakeTotal"))}});
        Players.update({_id: west_id}, {$inc: {hongKongChomboTotal: Number(Session.get("westMistakeTotal"))}});
        Players.update({_id: north_id}, {$inc: {hongKongChomboTotal: Number(Session.get("northMistakeTotal"))}});

        // Save number of hands (includes chombos, do we want this?)
        Players.update({_id: east_id}, {$inc: {hongKongHandsTotal: hands_array.length}});
        Players.update({_id: south_id}, {$inc: {hongKongHandsTotal: hands_array.length}});
        Players.update({_id: west_id}, {$inc: {hongKongHandsTotal: hands_array.length}});
        Players.update({_id: north_id}, {$inc: {hongKongHandsTotal: hands_array.length}});

        // Save number of hands won
        Players.update({_id: east_id}, {$inc: {hongKongHandsWin: Number(Session.get("eastPlayerWins"))}});
        Players.update({_id: south_id}, {$inc: {hongKongHandsWin: Number(Session.get("southPlayerWins"))}});
        Players.update({_id: west_id}, {$inc: {hongKongHandsWin: Number(Session.get("westPlayerWins"))}});
        Players.update({_id: north_id}, {$inc: {hongKongHandsWin: Number(Session.get("northPlayerWins"))}});

        // Save number of points won
        Players.update({_id: east_id}, {$inc: {hongKongWinPointsTotal: Number(Session.get("eastPlayerPointsWon"))}});
        Players.update({_id: south_id}, {$inc: {hongKongWinPointsTotal: Number(Session.get("southPlayerPointsWon"))}});
        Players.update({_id: west_id}, {$inc: {hongKongWinPointsTotal: Number(Session.get("westPlayerPointsWon"))}});
        Players.update({_id: north_id}, {$inc: {hongKongWinPointsTotal: Number(Session.get("northPlayerPointsWon"))}});

        // Save number of hands lost
        Players.update({_id: east_id}, {$inc: {hongKongHandsLose: Number(Session.get("eastPlayerLosses"))}});
        Players.update({_id: south_id}, {$inc: {hongKongHandsLose: Number(Session.get("southPlayerLosses"))}});
        Players.update({_id: west_id}, {$inc: {hongKongHandsLose: Number(Session.get("westPlayerLosses"))}});
        Players.update({_id: north_id}, {$inc: {hongKongHandsLose: Number(Session.get("northPlayerLosses"))}});

        // Calculates all positions quickly
        let positions = Constants.WINDS.map((wind) => ({ wind, score: Session.get(wind + "_score") })).sort((a, b) => b.score - a.score);
        let idMappings = { east: east_id, south: south_id, west: west_id, north: north_id };

        Players.update({ _id: idMappings[positions[0].wind] }, { $inc: { hongKongFirstPlaceSum: 1 }});
        Players.update({ _id: idMappings[positions[1].wind] }, { $inc: { hongKongSecondPlaceSum: 1 }});
        Players.update({ _id: idMappings[positions[2].wind] }, { $inc: { hongKongThirdPlaceSum: 1 }});
        Players.update({ _id: idMappings[positions[3].wind] }, { $inc: { hongKongFourthPlaceSum: 1 }});

        //Save game to database
        HongKongHands.insert(game);
    }
};

function push_dealin_hand(template) {
    var points = Number(Session.get("current_points"));
    var winnerWind = GameRecordUtils.playerToDirection(Session.get("round_winner"));
    var loserWind = GameRecordUtils.playerToDirection(Session.get("round_loser"));

    var eastDelta = dealin_delta(points, Constants.EAST, winnerWind, loserWind);
    var southDelta = dealin_delta(points, Constants.SOUTH, winnerWind, loserWind);
    var westDelta = dealin_delta(points, Constants.WEST, winnerWind, loserWind);
    var northDelta = dealin_delta(points, Constants.NORTH, winnerWind, loserWind);

    if          (winnerWind == Constants.EAST) {
        Session.set("eastPlayerWins", Number(Session.get("eastPlayerWins")) + 1);
        Session.set("eastPlayerPointsWon", Number(Session.get("eastPlayerPointsWon")) + points);
    }
    else if (winnerWind == Constants.SOUTH) {
        Session.set("southPlayerWins", Number(Session.get("southPlayerWins")) + 1);
        Session.set("southPlayerPointsWon", Number(Session.get("southPlayerPointsWon")) + points);
    }
    else if (winnerWind == Constants.WEST) {
        Session.set("westPlayerWins", Number(Session.get("westPlayerWins")) + 1);
        Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + points);
    }
    else if (winnerWind == Constants.NORTH) {
        Session.set("northPlayerWins", Number(Session.get("northPlayerWins")) + 1);
        Session.set("northPlayerPointsWon", Number(Session.get("northPlayerPointsWon")) + points);
    }

    if          (loserWind == Constants.EAST)
        Session.set("eastPlayerLosses", Number(Session.get("eastPlayerLosses")) + 1);
    else if (loserWind == Constants.SOUTH)
        Session.set("southPlayerLosses", Number(Session.get("southPlayerLosses")) + 1);
    else if (loserWind == Constants.WEST)
        Session.set("westPlayerLosses", Number(Session.get("westPlayerLosses")) + 1);
    else if (loserWind == Constants.NORTH)
        Session.set("northPlayerLosses", Number(Session.get("northPlayerLosses")) + 1);

    pushHand(template, Constants.DEAL_IN, eastDelta, southDelta, westDelta, northDelta);

    if (winnerWind == GameRecordUtils.roundToDealerDirection(Session.get("current_round"))) {
        Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
    } else {
        Session.set("current_bonus", 0);
        Session.set("current_round", Number(Session.get("current_round")) + 1)
    }
};

function push_selfdraw_hand(template) {
    var points = Number(Session.get("current_points"));
    var winnerWind = GameRecordUtils.playerToDirection(Session.get("round_winner"));

    var eastDelta = selfdraw_delta(points, Constants.EAST, winnerWind);
    var southDelta = selfdraw_delta(points, Constants.SOUTH, winnerWind);
    var westDelta = selfdraw_delta(points, Constants.WEST, winnerWind);
    var northDelta = selfdraw_delta(points, Constants.NORTH, winnerWind);

    if          (winnerWind == Constants.EAST) {
        Session.set("eastPlayerWins", Number(Session.get("eastPlayerWins")) + 1);
        Session.set("eastPlayerPointsWon", Number(Session.get("eastPlayerPointsWon")) + points);
    }
    else if (winnerWind == Constants.SOUTH) {
        Session.set("southPlayerWins", Number(Session.get("southPlayerWins")) + 1);
        Session.set("southPlayerPointsWon", Number(Session.get("southPlayerPointsWon")) + points);
    }
    else if (winnerWind == Constants.WEST) {
        Session.set("westPlayerWins", Number(Session.get("westPlayerWins")) + 1);
        Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + points);
    }
    else if (winnerWind == Constants.NORTH) {
        Session.set("northPlayerWins", Number(Session.get("northPlayerWins")) + 1);
        Session.set("northPlayerPointsWon", Number(Session.get("northPlayerPointsWon")) + points);
    }

    pushHand(template, Constants.SELF_DRAW, eastDelta, southDelta, westDelta, northDelta);

    if (winnerWind == GameRecordUtils.roundToDealerDirection(Session.get("current_round")))
        Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
    else {
        Session.set("current_bonus", 0);
        Session.set("current_round", Number(Session.get("current_round")) + 1);
    }
};

function push_pao_hand(template) {
    var points = Number(Session.get("current_points"));
    var winnerWind = GameRecordUtils.playerToDirection(Session.get("round_winner"));
    var paoWind = GameRecordUtils.playerToDirection(Session.get("round_pao_player"));

    var eastDelta = pao_delta(points, Constants.EAST, winnerWind, paoWind);
    var southDelta = pao_delta(points, Constants.SOUTH, winnerWind, paoWind);
    var westDelta = pao_delta(points, Constants.WEST, winnerWind, paoWind);
    var northDelta = pao_delta(points, Constants.NORTH, winnerWind, paoWind);

    if          (winnerWind == Constants.EAST) {
        Session.set("eastPlayerWins", Number(Session.get("eastPlayerWins")) + 1);
        Session.set("eastPlayerPointsWon", Number(Session.get("eastPlayerPointsWon")) + points);
    }
    else if (winnerWind == Constants.SOUTH) {
        Session.set("southPlayerWins", Number(Session.get("southPlayerWins")) + 1);
        Session.set("southPlayerPointsWon", Number(Session.get("southPlayerPointsWon")) + points);
    }
    else if (winnerWind == Constants.WEST) {
        Session.set("westPlayerWins", Number(Session.get("westPlayerWins")) + 1);
        Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + points);
    }
    else if (winnerWind == Constants.NORTH) {
        Session.set("northPlayerWins", Number(Session.get("northPlayerWins")) + 1);
        Session.set("northPlayerPointsWon", Number(Session.get("northPlayerPointsWon")) + points);
    }

    if          (loserWind == Constants.EAST)
        Session.set("eastPlayerLosses", Number(Session.get("eastPlayerLosses")) + 1);
    else if (loserWind == Constants.SOUTH)
        Session.set("southPlayerLosses", Number(Session.get("southPlayerLosses")) + 1);
    else if (loserWind == Constants.WEST)
        Session.set("westPlayerLosses", Number(Session.get("westPlayerLosses")) + 1);
    else if (loserWind == Constants.NORTH)
        Session.set("northPlayerLosses", Number(Session.get("northPlayerLosses")) + 1);

    pushHand(template, Constants.PAO, eastDelta, southDelta, westDelta, northDelta);

    if (winnerWind == GameRecordUtils.roundToDealerDirection(Session.get("current_round")))
        Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
    else {
        Session.set("current_bonus", 0);
        Session.set("current_round", Number(Session.get("current_round")) + 1)
    }
};

function push_nowin_hand(template) {
    pushHand(template, Constants.NO_WIN, 0, 0, 0, 0);
    if (Number(Session.get("current_round")) == 16) {
        Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
    } else {
        Session.set("current_round", Number(Session.get("current_round")) + 1);
    }

};

function push_mistake_hand(template) {
    var loserWind = GameRecordUtils.playerToDirection(Session.get("round_loser"));

    var eastDelta = mistake_delta(Constants.EAST, loserWind);
    var southDelta = mistake_delta(Constants.SOUTH, loserWind);
    var westDelta = mistake_delta(Constants.WEST, loserWind);
    var northDelta = mistake_delta(Constants.NORTH, loserWind);

    if          (loserWind == Constants.EAST)  Session.set("eastMistakeTotal",  Number(Session.get("eastMistakeTotal"))  + 1);
    else if (loserWind == Constants.SOUTH) Session.set("southMistakeTotal", Number(Session.get("southMistakeTotal")) + 1);
    else if (loserWind == Constants.WEST)  Session.set("westMistakeTotal",      Number(Session.get("westMistakeTotal"))  + 1);
    else if (loserWind == Constants.NORTH) Session.set("northMistakeTotal", Number(Session.get("northMistakeTotal")) + 1);

    pushHand(template, Constants.MISTAKE, eastDelta, southDelta, westDelta, northDelta);
};

function pushHand(template, handType, eastDelta, southDelta, westDelta, northDelta) {
    template.hands.push(
        {
            handType: handType,
            round: Session.get("current_round"),
            bonus: Session.get("current_bonus"),
            points: Session.get("current_points"),
            eastDelta: eastDelta,
            southDelta: southDelta,
            westDelta: westDelta,
            northDelta: northDelta,
        });

    Session.set("east_score", Number(Session.get("east_score")) + eastDelta);
    Session.set("south_score", Number(Session.get("south_score")) + southDelta);
    Session.set("west_score", Number(Session.get("west_score")) + westDelta);
    Session.set("north_score", Number(Session.get("north_score")) + northDelta);
};

function dealin_delta(points, playerWind, winnerWind, loserWind) {
    var retval;

    if (playerWind != winnerWind && playerWind != loserWind) {
        return 0;
    }

    switch (points) {
    case 3: retval = -16; break;
    case 4: retval = -32; break;
    case 5: retval = -48; break;
    case 6: retval = -64; break;
    case 7: retval = -96; break;
    case 8: retval = -128; break;
    case 9: retval = -192; break;
    case 10: retval = -256; break;
    case 11: retval = -384; break;
    case 12: retval = -512; break;
    case 13: retval = -768; break;
    }

    if ( playerWind == winnerWind ) retval = -retval;

    return retval;
};

function selfdraw_delta(points, playerWind, winnerWind) {
    var retval;

    switch (points) {
    case 3: retval = -8; break;
    case 4: retval = -16; break;
    case 5: retval = -24; break;
    case 6: retval = -32; break;
    case 7: retval = -48; break;
    case 8: retval = -64; break;
    case 9: retval = -96; break;
    case 10: retval = -128; break;
    case 11: retval = -192; break;
    case 12: retval = -256; break;
    case 13: retval = -384; break;
    }

    if ( playerWind == winnerWind )
        retval = -3 * retval;

    return retval;
};

function pao_delta(points, playerWind, winnerWind, loserWind) {
    var retval;

    if (playerWind != winnerWind && playerWind != loserWind) {
        return 0;
    }

    switch (points) {
    case 3: retval = -24; break;
    case 4: retval = -48; break;
    case 5: retval = -72; break;
    case 6: retval = -96; break;
    case 7: retval = -144; break;
    case 8: retval = -192; break;
    case 9: retval = -288; break;
    case 10: retval = -384; break;
    case 11: retval = -576; break;
    case 12: retval = -768; break;
    case 13: retval = -1152; break;
    }

    if ( playerWind == winnerWind ) retval = -retval;

    return retval;
};

function mistake_delta(playerWind, loserWind) {
    if (playerWind == loserWind) return -Constants.HKG_MISTAKE_POINTS;
    else return Constants.HKG_MISTAKE_POINTS / 3;
};

Template.points.events({
    //'click .point_value'(event) {
    'change select[name="points"]'(event) {
        Session.set("current_points", event.target.value);
    }
});

function resetRoundStats() {
    Session.set("current_points", 0);
    Session.set("round_winner", Constants.NO_PERSON);
    Session.set("round_loser", Constants.NO_PERSON);
    Session.set("round_pao_player", Constants.NO_PERSON);

    $( ".winner_buttons button" ).removeClass("disabled");
    $( ".loser_buttons button" ).removeClass("disabled");
    $( ".pao_buttons button" ).removeClass("disabled");

    $( ".winner_buttons button" ).removeClass("active");
    $( ".loser_buttons button" ).removeClass("active");
    $( ".pao_buttons button" ).removeClass("active");

    $( "select.points" ).val(undefined);
}
