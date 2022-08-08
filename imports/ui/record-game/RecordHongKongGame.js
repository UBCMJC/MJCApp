//Databases
import Players from '../../api/Players';
import { HongKongHands, InProgressHongKongHands } from '../../api/GameDatabases';

import Constants from '../../api/Constants';
import EloCalculator from '../../api/EloCalculator';
import GameRecordUtils from '../../api/utils/GameRecordUtils';

import './RecordHongKongGame.html';

Template.RecordHongKongGame.onCreated( function() {
    this.hand_type = new ReactiveVar( Constants.HKG_DEAL_IN );
    this.hands = new ReactiveArray();

    GameRecordUtils.resetGameValues(Constants.HKG_START_POINTS);

    let self = this;
    if (localStorage.getItem("game_id") !== null) {
        Session.set("game_id", localStorage.getItem("game_id"));
        if (localStorage.getItem("game_type") !== "hk") {
            return;
        }
        Meteor.call('canRetrieveInProgressHongKongGame', function (error, game) {
            for (let i = 0; i < game.all_hands.length; i++) {
                let hand = game.all_hands[i];
                self.hands.push({
                    handType: hand.handType,
                    round: hand.round,
                    bonus: hand.bonus,
                    points: hand.points,
                    eastDelta: hand.eastDelta,
                    southDelta: hand.southDelta,
                    westDelta: hand.westDelta,
                    northDelta: hand.northDelta,
                });
            }

            Meteor.call('canRetrievePlayer', game.east_player, function (error, exists) {
                Session.set("current_east", game.east_player);
                Session.set("current_south", game.south_player);
                Session.set("current_west", game.west_player);
                Session.set("current_north", game.north_player);
            });

            Session.set("east_score", game.east_score);
            Session.set("south_score", game.south_score);
            Session.set("west_score", game.west_score);
            Session.set("north_score", game.north_score);

            Session.set("current_round", game.current_round);
            Session.set("current_bonus", game.current_bonus);

            Session.set("eastPlayerWins", game.eastPlayerWins);
            Session.set("southPlayerWins", game.southPlayerWins);
            Session.set("westPlayerWins", game.westPlayerWins);
            Session.set("northPlayerWins", game.northPlayerWins);

            Session.set("eastPlayerLosses", game.eastPlayerLosses);
            Session.set("southPlayerLosses", game.southPlayerLosses);
            Session.set("westPlayerLosses", game.westPlayerLosses);
            Session.set("northPlayerLosses", game.northPlayerLosses);

            Session.set("eastPlayerPointsWon", game.eastPlayerPointsWon);
            Session.set("southPlayerPointsWon", game.southPlayerPointsWon);
            Session.set("westPlayerPointsWon", game.westPlayerPointsWon);
            Session.set("northPlayerPointsWon", game.northPlayerPointsWon);

            Session.set("eastMistakeTotal", game.eastMistakeTotal);
            Session.set("southMistakeTotal", game.southMistakeTotal);
            Session.set("westMistakeTotal", game.westMistakeTotal);
            Session.set("northMistakeTotal", game.northMistakeTotal);
        });
    }
});

Template.RecordHongKongGame.onRendered( function() {
    if (localStorage.getItem("game_id") !== null) {
        if (localStorage.getItem("game_type") !== "hk") {
            document.getElementById("hk_container").style.display = "none";
            window.alert("Please submit games in progress before starting a new game!");
            return;
        }
        document.getElementById("hk_names").style.display = "none";
        document.getElementById("hk_game_buttons").style.display = "block";
        if (localStorage.getItem("game_over") == 1) {
            $( ".submit_hand_button" ).addClass( "disabled" );
            $( ".submit_game_button" ).removeClass( "disabled" );
            $( ".delete_hand_button" ).removeClass( "disabled" );
        } else if (Session.get("current_round") > 0) {
            $( ".delete_hand_button" ).removeClass( "disabled" );
        }
    }
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
    is_mistake(hand_type) {
        return hand_type == Constants.MISTAKE;
    },
    is_pao(hand_type) {
        return hand_type == Constants.PAO;
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
                document.getElementById("hk_names").style.display = "none";
                document.getElementById("hk_game_buttons").style.display = "block";
            } else {
                window.alert("Please enter all 4 player names!");
            }
        }

        let position;
        let east_player = Session.get("current_east");
        let south_player= Session.get("current_south");
        let west_player = Session.get("current_west");
        let north_player= Session.get("current_north");

        let game = {
                timestamp: Date.now(),
                east_player: east_player,
                south_player: south_player,
                west_player: west_player,
                north_player: north_player,
                east_score: Constants.HKG_START_POINTS,
                south_score: Constants.HKG_START_POINTS,
                west_score: Constants.HKG_START_POINTS,
                north_score: Constants.HKG_START_POINTS,
                current_round: 1,
                current_bonus: 0,
                all_hands: [],
                eastPlayerWins: 0,
                southPlayerWins: 0,
                westPlayerWins: 0,
                northPlayerWins: 0,
                eastPlayerLosses: 0,
                southPlayerLosses: 0,
                westPlayerLosses: 0,
                northPlayerLosses: 0,
                eastPlayerPointsWon: 0,
                southPlayerPointsWon: 0,
                westPlayerPointsWon: 0,
                northPlayerPointsWon: 0,
                eastMistakeTotal: 0,
                southMistakeTotal: 0,
                westMistakeTotal: 0,
                northMistakeTotal: 0
        };
        Meteor.call('insertInProgressHongKongGame', game, function (error, game_id) {
            Session.set("game_id", game_id);
            localStorage.setItem("game_id", Session.get("game_id"));
            localStorage.setItem("game_type", "hk");
            localStorage.setItem("game_over", 0);
        });
    },
    //Submission of a hand
    'click .submit_hand_button'(event, template) {

        if ( !$( event.target ).hasClass( "disabled")) {
            let pnt = Number(Session.get("current_points"));
            console.log(template.hand_type.get());
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
                        Session.get("round_winner") != Session.get("round_pao_player")) {
                        if (Session.get("current_points") != 0) {
                            push_pao_hand(template);
                            resetRoundStats();
                            $( ".delete_hand_button" ).removeClass( "disabled" );
                        } else {
                            window.alert("Invalid points entry!");
                        }
                    } else {
                        window.alert("You need to fill out who won, and who has pao penalty!");
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

            let game = {
               game_id: Session.get("game_id"),
               all_hands: template.hands.get(),
               current_round: Session.get("current_round"),
               current_bonus: Session.get("current_bonus"),
               eastPlayerWins: Session.get("eastPlayerWins"),
               southPlayerWins: Session.get("southPlayerWins"),
               westPlayerWins: Session.get("westPlayerWins"),
               northPlayerWins: Session.get("northPlayerWins"),
               eastPlayerLosses: Session.get("eastPlayerLosses"),
               southPlayerLosses: Session.get("southPlayerLosses"),
               westPlayerLosses: Session.get("westPlayerLosses"),
               northPlayerLosses: Session.get("northPlayerLosses"),
               eastPlayerPointsWon: Session.get("eastPlayerPointsWon"),
               southPlayerPointsWon: Session.get("southPlayerPointsWon"),
               westPlayerPointsWon: Session.get("westPlayerPointsWon"),
               northPlayerPointsWon: Session.get("northPlayerPointsWon"),
               eastMistakeTotal: Session.get("eastMistakeTotal"),
               southMistakeTotal: Session.get("southMistakeTotal"),
               westMistakeTotal: Session.get("westMistakeTotal"),
               northMistakeTotal: Session.get("northMistakeTotal"),
               eastDelta: current_hand.eastDelta,
               southDelta: current_hand.southDelta,
               westDelta: current_hand.westDelta,
               northDelta: current_hand.northDelta
            }

            Meteor.call('updateInProgressHongKongGame', game);

            if (GameRecordUtils.someoneBankrupt() ||
                Session.get("current_round") > 16) {
                localStorage.setItem("game_over", 1);
                $( event.target ).addClass( "disabled");
                $( ".submit_game_button" ).removeClass( "disabled" );
            }
        }

    },
    //Remove the last submitted hand
    'click .delete_hand_button'(event, template) {
        if ( !$( event.target ).hasClass( "disabled" )) {
            let r = confirm("Are you sure you want to delete the last hand?");
            if (r == true) {
                let del_hand = Template.instance().hands.pop();

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

                let game = {
                   game_id: Session.get("game_id"),
                   all_hands: template.hands.get(),
                   current_round: Session.get("current_round"),
                   current_bonus: Session.get("current_bonus"),
                   eastPlayerWins: Session.get("eastPlayerWins"),
                   southPlayerWins: Session.get("southPlayerWins"),
                   westPlayerWins: Session.get("westPlayerWins"),
                   northPlayerWins: Session.get("northPlayerWins"),
                   eastPlayerLosses: Session.get("eastPlayerLosses"),
                   southPlayerLosses: Session.get("southPlayerLosses"),
                   westPlayerLosses: Session.get("westPlayerLosses"),
                   northPlayerLosses: Session.get("northPlayerLosses"),
                   eastPlayerPointsWon: Session.get("eastPlayerPointsWon"),
                   southPlayerPointsWon: Session.get("southPlayerPointsWon"),
                   westPlayerPointsWon: Session.get("westPlayerPointsWon"),
                   northPlayerPointsWon: Session.get("northPlayerPointsWon"),
                   eastMistakeTotal: Session.get("eastMistakeTotal"),
                   southMistakeTotal: Session.get("southMistakeTotal"),
                   westMistakeTotal: Session.get("westMistakeTotal"),
                   northMistakeTotal: Session.get("northMistakeTotal"),
                   eastDelta: - Number(del_hand.eastDelta),
                   southDelta: - Number(del_hand.southDelta),
                   westDelta: - Number(del_hand.westDelta),
                   northDelta: - Number(del_hand.northDelta)
                }

                Meteor.call('updateInProgressHongKongGame', game);
            }
        }
    },
    //Delete a game from the database

    'click .delete_game_button'(event, template) {
        if ( !$(event.target ).hasClass( "disabled" )) {
            let r = confirm("Are you sure you want to delete this game?");
            if (r == true) {
                let r2 = confirm("Are you sure sure you want to delete this game?");
                if (r2 == true) {
                    localStorage.clear();

                    //deletes game from database
                    InProgressHongKongHands.remove({_id: Session.get("game_id")});

                    //resets page UI
                    document.getElementById("hk_names").style.display = "block";
                    document.getElementById("hk_game_buttons").style.display = "none";


                    //Deletes all hands to reset to empty game
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

                    resetRoundStats();

                    $( ".submit_hand_button" ).removeClass( "disabled" );
                    $( ".submit_game_button" ).addClass( "disabled" );
                    $( ".delete_hand_button" ).addClass( "disabled" );
                }
            }

        }
    },

    //Submit a game to the database
    'click .submit_game_button'(event, template) {
        let r = confirm("Are you sure you want to submit this game?");
        if (r == true) {
            localStorage.clear();
            save_game_to_database(template.hands.get());

            //resets page UI
            document.getElementById("hk_names").style.display = "block";
            document.getElementById("hk_game_buttons").style.display = "none";

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
        let hand_type = $( event.target ).closest( "li" );

        hand_type.addClass( "active" );
        $( ".nav-pills li" ).not( hand_type ).removeClass( "active" );

        template.hand_type.set( hand_type.data( "template" ) );
    },
});

function save_game_to_database(hands_array) {

    let east_player = Session.get("current_east");
    let south_player= Session.get("current_south");
    let west_player = Session.get("current_west");
    let north_player= Session.get("current_north");

    let game = {
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

    let hk_elo_calculator = new EloCalculator(Constants.ELO_CALCULATOR_N,
                                              Constants.ELO_CALCULATOR_EXP,
                                              Constants.HKG_SCORE_ADJUSTMENT,
                                              game,
                                              Constants.GAME_TYPE.HONG_KONG);

    let game2 = {
        positions: Constants.WINDS.map((wind) => ({ wind, score: Session.get(wind + "_score") })).sort((a, b) => b.score - a.score),
        hands_array_length: hands_array.length,
        east_elo_delta: hk_elo_calculator.eloChange(east_player),
        south_elo_delta: hk_elo_calculator.eloChange(south_player),
        west_elo_delta: hk_elo_calculator.eloChange(west_player),
        north_elo_delta: hk_elo_calculator.eloChange(north_player),
        east_player: east_player,
        south_player: south_player,
        west_player: west_player,
        north_player: north_player,
        east_score: Session.get("east_score"),
        south_score: Session.get("south_score"),
        west_score: Session.get("west_score"),
        north_score: Session.get("north_score"),
        eastPlayerWins: Session.get("eastPlayerWins"),
        southPlayerWins: Session.get("southPlayerWins"),
        westPlayerWins: Session.get("westPlayerWins"),
        northPlayerWins: Session.get("northPlayerWins"),
        eastPlayerLosses: Session.get("eastPlayerLosses"),
        southPlayerLosses: Session.get("southPlayerLosses"),
        westPlayerLosses: Session.get("westPlayerLosses"),
        northPlayerLosses: Session.get("northPlayerLosses"),
        eastMistakeTotal: Session.get("eastMistakeTotal"),
        southMistakeTotal: Session.get("southMistakeTotal"),
        westMistakeTotal: Session.get("westMistakeTotal"),
        northMistakeTotal: Session.get("northMistakeTotal"),
        eastPlayerPointsWon: Session.get("eastPlayerPointsWon"),
        southPlayerPointsWon: Session.get("southPlayerPointsWon"),
        westPlayerPointsWon: Session.get("westPlayerPointsWon"),
        northPlayerPointsWon: Session.get("northPlayerPointsWon"),
        eastMistakeTotal: Session.get("eastMistakeTotal"),
        southMistakeTotal: Session.get("southMistakeTotal"),
        westMistakeTotal: Session.get("westMistakeTotal"),
        northMistakeTotal: Session.get("northMistakeTotal"),
    };

    //updates player info
    Meteor.call('updateHongKongPlayers', game2);

    //Save game to database
    Meteor.call('insertHongKongGame', game);

    //deletes game from in progress database
    Meteor.call('removeInProgressHongKongGame', Session.get("game_id"));
};

function push_dealin_hand(template) {
    let points = Number(Session.get("current_points"));
    let winnerWind = GameRecordUtils.playerToDirection(Session.get("round_winner"));
    let loserWind = GameRecordUtils.playerToDirection(Session.get("round_loser"));

    let eastDelta = dealin_delta(points, Constants.EAST, winnerWind, loserWind);
    let southDelta = dealin_delta(points, Constants.SOUTH, winnerWind, loserWind);
    let westDelta = dealin_delta(points, Constants.WEST, winnerWind, loserWind);
    let northDelta = dealin_delta(points, Constants.NORTH, winnerWind, loserWind);

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
    let points = Number(Session.get("current_points"));
    let winnerWind = GameRecordUtils.playerToDirection(Session.get("round_winner"));

    let eastDelta = selfdraw_delta(points, Constants.EAST, winnerWind);
    let southDelta = selfdraw_delta(points, Constants.SOUTH, winnerWind);
    let westDelta = selfdraw_delta(points, Constants.WEST, winnerWind);
    let northDelta = selfdraw_delta(points, Constants.NORTH, winnerWind);

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
    const points = Number(Session.get("current_points"));
    const winnerWind = GameRecordUtils.playerToDirection(Session.get("round_winner"));
    const paoWind = GameRecordUtils.playerToDirection(Session.get("round_pao_player"));

    const eastDelta = pao_delta(points, Constants.EAST, winnerWind, paoWind);
    const southDelta = pao_delta(points, Constants.SOUTH, winnerWind, paoWind);
    const westDelta = pao_delta(points, Constants.WEST, winnerWind, paoWind);
    const northDelta = pao_delta(points, Constants.NORTH, winnerWind, paoWind);

    if (winnerWind === Constants.EAST) {
        Session.set("eastPlayerWins", Number(Session.get("eastPlayerWins")) + 1);
        Session.set("eastPlayerPointsWon", Number(Session.get("eastPlayerPointsWon")) + points);
    }
    else if (winnerWind === Constants.SOUTH) {
        Session.set("southPlayerWins", Number(Session.get("southPlayerWins")) + 1);
        Session.set("southPlayerPointsWon", Number(Session.get("southPlayerPointsWon")) + points);
    }
    else if (winnerWind === Constants.WEST) {
        Session.set("westPlayerWins", Number(Session.get("westPlayerWins")) + 1);
        Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + points);
    }
    else if (winnerWind === Constants.NORTH) {
        Session.set("northPlayerWins", Number(Session.get("northPlayerWins")) + 1);
        Session.set("northPlayerPointsWon", Number(Session.get("northPlayerPointsWon")) + points);
    }

    pushHand(template, Constants.PAO, eastDelta, southDelta, westDelta, northDelta);

    if (winnerWind === GameRecordUtils.roundToDealerDirection(Session.get("current_round"))) {
        Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
    } else {
        Session.set("current_bonus", 0);
        Session.set("current_round", Number(Session.get("current_round")) + 1);
    }
};

function push_nowin_hand(template) {
    pushHand(template, Constants.NO_WIN, 0, 0, 0, 0);

    if (Number(Session.get("current_round")) != Constants.HANDS_PER_ROUND * Constants.HKG_NUM_ROUNDS) {
        Session.set("current_round", Number(Session.get("current_round")) + 1);
    } else {
        Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
    }
};

function push_restart_hand(template) {
    pushHand(template, Constants.RESTART, 0, 0, 0, 0);

    Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
};

function push_mistake_hand(template) {
    let loserWind = GameRecordUtils.playerToDirection(Session.get("round_loser"));

    let eastDelta = mistake_delta(Constants.EAST, loserWind);
    let southDelta = mistake_delta(Constants.SOUTH, loserWind);
    let westDelta = mistake_delta(Constants.WEST, loserWind);
    let northDelta = mistake_delta(Constants.NORTH, loserWind);

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
    let retval;

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

    return (playerWind == winnerWind) ? -retval : retval;
};

function selfdraw_delta(points, playerWind, winnerWind) {
    let retval;

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

    return (playerWind == winnerWind) ? -3 * retval : retval;
};

function pao_delta(points, playerWind, winnerWind, paoWind) {
    let retval;

    if (playerWind != winnerWind && playerWind != paoWind) {
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

    return (playerWind == winnerWind) ? -retval : retval;
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
