import { Mongo } from 'meteor/mongo';

import Players from './Players';

export const HongKongHands = new Mongo.Collection('hongKongHands');
export const JapaneseHands = new Mongo.Collection('japaneseHands');
export const InProgressHongKongHands = new Mongo.Collection('inProgressHongKongHands');
export const InProgressJapaneseHands = new Mongo.Collection('inProgressJapaneseHands');

if (Meteor.isServer){
   InProgressJapaneseHands.createIndex( { "timestamp": 1}, { expireAfterSeconds: 86400} );
   InProgressHongKongHands.createIndex( { "timestamp": 1}, { expireAfterSeconds: 86400} );
}

Meteor.methods({
  canRetrievePlayer: function () {
     return Players.find().fetch();
  },

  insertJapaneseGame: function(game) {
     JapaneseHands.insert(game);
  },

  insertHongKongGame: function(game) {
     HongKongHands.insert(game);
  },


  canRetrieveInProgressJapaneseGame: function(game_id) {
    return InProgressJapaneseHands.findOne({_id: game_id});
  },

  canRetrieveInProgressHongKongGame: function (game_id) {
    return InProgressHongKongHands.findOne({_id: game_id});
  },

  insertInProgressJapaneseGame: function (game) {
     return InProgressJapaneseHands.insert(game);
  },

  insertInProgressHongKongGame: function (game) {
       return InProgressHongKongHands.insert(game);
  },

  updateInProgressJapaneseGame: function (game) {
     InProgressJapaneseHands.update({_id: game.game_id},
         {$set:{all_hands: game.all_hands,
                current_round: game.current_round,
                current_bonus: game.current_bonus,
                free_riichi_sticks: game.free_riichi_sticks,
                riichi_sum_history: game.riichi_sum_history,
                riichi_round_history: game.riichi_round_history,
                eastPlayerWins: game.eastPlayerWins,
                southPlayerWins: game.southPlayerWins,
                westPlayerWins: game.westPlayerWins,
                northPlayerWins: game.northPlayerWins,
                eastPlayerLosses: game.eastPlayerLosses,
                southPlayerLosses: game.southPlayerLosses,
                westPlayerLosses: game.westPlayerLosses,
                northPlayerLosses: game.northPlayerLosses,
                eastPlayerPointsWon: game.eastPlayerPointsWon,
                southPlayerPointsWon: game.southPlayerPointsWon,
                westPlayerPointsWon: game.westPlayerPointsWon,
                northPlayerPointsWon: game.northPlayerPointsWon,
                eastMistakeTotal: game.eastMistakeTotal,
                southMistakeTotal: game.southMistakeTotal,
                westMistakeTotal: game.westMistakeTotal,
                northMistakeTotal: game.northMistakeTotal,
                east_riichi_sum: game.east_riichi_sum,
                south_riichi_sum: game.south_riichi_sum,
                west_riichi_sum: game.west_riichi_sum,
                north_riichi_sum: game.north_riichi_sum,
                eastPlayerRiichisWon: game.eastPlayerRiichisWon,
                southPlayerRiichisWon: game.southPlayerRiichisWon,
                westPlayerRiichisWon: game.westPlayerRiichisWon,
                northPlayerRiichisWon: game.northPlayerRiichisWon,
                eastPlayerDoraSum: game.eastPlayerDoraSum,
                southPlayerDoraSum: game.southPlayerDoraSum,
                westPlayerDoraSum: game.westPlayerDoraSum,
                northPlayerDoraSum: game.northPlayerDoraSum},
         $inc: {east_score: game.eastDelta, south_score: game.southDelta,
                west_score: game.westDelta, north_score: game.northDelta}});
  },

  updateInProgressHongKongGame: function (game) {
       InProgressHongKongHands.update({_id: game.game_id},
           {$set:{all_hands: game.all_hands,
                  current_round: game.current_round,
                  current_bonus: game.current_bonus,
                  eastPlayerWins: game.eastPlayerWins,
                  southPlayerWins: game.southPlayerWins,
                  westPlayerWins: game.westPlayerWins,
                  northPlayerWins: game.northPlayerWins,
                  eastPlayerLosses: game.eastPlayerLosses,
                  southPlayerLosses: game.southPlayerLosses,
                  westPlayerLosses: game.westPlayerLosses,
                  northPlayerLosses: game.northPlayerLosses,
                  eastPlayerPointsWon: game.eastPlayerPointsWon,
                  southPlayerPointsWon: game.southPlayerPointsWon,
                  westPlayerPointsWon: game.westPlayerPointsWon,
                  northPlayerPointsWon: game.northPlayerPointsWon,
                  eastMistakeTotal: game.eastMistakeTotal,
                  southMistakeTotal: game.southMistakeTotal,
                  westMistakeTotal: game.westMistakeTotal,
                  northMistakeTotal: game.northMistakeTotal},
           $inc: {east_score: game.eastDelta, south_score: game.southDelta,
                  west_score: game.westDelta, north_score: game.northDelta}});
    },

  removeInProgressJapaneseGame: function (game_id) {
       return InProgressJapaneseHands.remove({_id: game_id});
  },

  removeInProgressHongKongGame: function (game_id) {
         return InProgressHongKongHands.remove({_id: game_id});
  },

  updateJapanesePlayers: function (game) {

       let east_id = Players.findOne({japaneseLeagueName: game.east_player}, {})._id;
       let south_id = Players.findOne({japaneseLeagueName: game.south_player}, {})._id;
       let west_id = Players.findOne({japaneseLeagueName: game.west_player}, {})._id;
       let north_id = Players.findOne({japaneseLeagueName: game.north_player}, {})._id;

       if (game.east_elo_delta != NaN && game.south_elo_delta != NaN && game.west_elo_delta != NaN && game.north_elo_delta != NaN) {
           // Save ELO
           Players.update({_id: east_id}, {$inc: {japaneseElo: Number(game.east_elo_delta)}});
           Players.update({_id: south_id}, {$inc: {japaneseElo: Number(game.south_elo_delta)}});
           Players.update({_id: west_id}, {$inc: {japaneseElo: Number(game.west_elo_delta)}});
           Players.update({_id: north_id}, {$inc: {japaneseElo: Number(game.north_elo_delta)}});

           // Update number of games
           Players.update({_id: east_id}, {$inc: {japaneseGamesPlayed: 1}});
           Players.update({_id: south_id}, {$inc: {japaneseGamesPlayed: 1}});
           Players.update({_id: west_id}, {$inc: {japaneseGamesPlayed: 1}});
           Players.update({_id: north_id}, {$inc: {japaneseGamesPlayed: 1}});

           // Update bankruptcy count
           if (Number(game.east_score) < 0)
               Players.update({_id: east_id}, {$inc: {japaneseBankruptTotal: 1}});
           if (Number(game.south_score) < 0)
               Players.update({_id: south_id}, {$inc: {japaneseBankruptTotal: 1}});
           if (Number(game.west_score) < 0)
               Players.update({_id: west_id}, {$inc: {japaneseBankruptTotal: 1}});
           if (Number(game.north_score) < 0)
               Players.update({_id: north_id}, {$inc: {japaneseBankruptTotal: 1}});

           // Save chombo counts
           Players.update({_id: east_id}, {$inc: {japaneseChomboTotal: Number(game.eastMistakeTotal)}});
           Players.update({_id: south_id}, {$inc: {japaneseChomboTotal: Number(game.southMistakeTotal)}});
           Players.update({_id: west_id}, {$inc: {japaneseChomboTotal: Number(game.westMistakeTotal)}});
           Players.update({_id: north_id}, {$inc: {japaneseChomboTotal: Number(game.northMistakeTotal)}});

           // Update riichi count
           Players.update({_id: east_id}, {$inc: {japaneseRiichiTotal: Number(game.east_riichi_sum)}});
           Players.update({_id: south_id}, {$inc: {japaneseRiichiTotal: Number(game.south_riichi_sum)}});
           Players.update({_id: west_id}, {$inc: {japaneseRiichiTotal: Number(game.west_riichi_sum)}});
           Players.update({_id: north_id}, {$inc: {japaneseRiichiTotal: Number(game.north_riichi_sum)}});

           // Update hands count (Includes chombos, do we want this?)
           Players.update({_id: east_id}, {$inc: {japaneseHandsTotal: game.hands_array_length}});
           Players.update({_id: south_id}, {$inc: {japaneseHandsTotal: game.hands_array_length}});
           Players.update({_id: west_id}, {$inc: {japaneseHandsTotal: game.hands_array_length}});
           Players.update({_id: north_id}, {$inc: {japaneseHandsTotal: game.hands_array_length}});

           // Save number of hands won
           Players.update({_id: east_id}, {$inc: {japaneseHandsWin: Number(game.eastPlayerWins)}});
           Players.update({_id: south_id}, {$inc: {japaneseHandsWin: Number(game.southPlayerWins)}});
           Players.update({_id: west_id}, {$inc: {japaneseHandsWin: Number(game.westPlayerWins)}});
           Players.update({_id: north_id}, {$inc: {japaneseHandsWin: Number(game.northPlayerWins)}});

           // Save number of points won
           Players.update({_id: east_id}, {$inc: {japaneseWinPointsTotal: Number(game.eastPlayerPointsWon)}});
           Players.update({_id: south_id}, {$inc: {japaneseWinPointsTotal: Number(game.southPlayerPointsWon)}});
           Players.update({_id: west_id}, {$inc: {japaneseWinPointsTotal: Number(game.westPlayerPointsWon)}});
           Players.update({_id: north_id}, {$inc: {japaneseWinPointsTotal: Number(game.northPlayerPointsWon)}});

           // Update total dora
           Players.update({_id: east_id}, {$inc: {japaneseWinDoraTotal: Number(game.eastPlayerDoraSum)}});
           Players.update({_id: south_id}, {$inc: {japaneseWinDoraTotal: Number(game.southPlayerDoraSum)}});
           Players.update({_id: west_id}, {$inc: {japaneseWinDoraTotal: Number(game.westPlayerDoraSum)}});
           Players.update({_id: north_id}, {$inc: {japaneseWinDoraTotal: Number(game.northPlayerDoraSum)}});

           // Save number of riichied hands won
           Players.update({_id: east_id}, {$inc: {japaneseWinRiichiTotal: Number(game.eastPlayerRiichisWon)}});
           Players.update({_id: south_id}, {$inc: {japaneseWinRiichiTotal: Number(game.southPlayerRiichisWon)}});
           Players.update({_id: west_id}, {$inc: {japaneseWinRiichiTotal: Number(game.westPlayerRiichisWon)}});
           Players.update({_id: north_id}, {$inc: {japaneseWinRiichiTotal: Number(game.northPlayerRiichisWon)}});

           // Save number of hands lost
           Players.update({_id: east_id}, {$inc: {japaneseHandsLose: Number(game.eastPlayerLosses)}});
           Players.update({_id: south_id}, {$inc: {japaneseHandsLose: Number(game.southPlayerLosses)}});
           Players.update({_id: west_id}, {$inc: {japaneseHandsLose: Number(game.westPlayerLosses)}});
           Players.update({_id: north_id}, {$inc: {japaneseHandsLose: Number(game.northPlayerLosses)}});

           let idMappings = { east: east_id, south: south_id, west: west_id, north: north_id };

           // Calculates all positions quickly
           Players.update({ _id: idMappings[game.positions[0].wind] }, { $inc: { japaneseFirstPlaceSum: 1 }});
           Players.update({ _id: idMappings[game.positions[1].wind] }, { $inc: { japaneseSecondPlaceSum: 1 }});
           Players.update({ _id: idMappings[game.positions[2].wind] }, { $inc: { japaneseThirdPlaceSum: 1 }});
           Players.update({ _id: idMappings[game.positions[3].wind] }, { $inc: { japaneseFourthPlaceSum: 1 }});
       }
    },

    updateHongKongPlayers: function (game) {

       let east_id = Players.findOne({hongKongLeagueName: game.east_player}, {})._id;
       let south_id = Players.findOne({hongKongLeagueName: game.south_player}, {})._id;
       let west_id = Players.findOne({hongKongLeagueName: game.west_player}, {})._id;
       let north_id = Players.findOne({hongKongLeagueName: game.north_player}, {})._id;

       if (game.east_elo_delta != NaN && game.south_elo_delta != NaN && game.west_elo_delta != NaN && game.north_elo_delta != NaN) {
           // Save ELO
           Players.update({_id: east_id}, {$inc: {hongKongElo: game.east_elo_delta}});
           Players.update({_id: south_id}, {$inc: {hongKongElo: game.south_elo_delta}});
           Players.update({_id: west_id}, {$inc: {hongKongElo: game.west_elo_delta}});
           Players.update({_id: north_id}, {$inc: {hongKongElo: game.north_elo_delta}});

           // Save number of games
           Players.update({_id: east_id}, {$inc: {hongKongGamesPlayed: 1}});
           Players.update({_id: south_id}, {$inc: {hongKongGamesPlayed: 1}});
           Players.update({_id: west_id}, {$inc: {hongKongGamesPlayed: 1}});
           Players.update({_id: north_id}, {$inc: {hongKongGamesPlayed: 1}});

           // Save bankruptcy counts
           if (Number(game.east_score) < 0)
               Players.update({_id: east_id}, {$inc: {hongKongBankruptTotal: 1}});
           if (Number(game.south_score) < 0)
               Players.update({_id: south_id}, {$inc: {hongKongBankruptTotal: 1}});
           if (Number(game.west_score) < 0)
               Players.update({_id: west_id}, {$inc: {hongKongBankruptTotal: 1}});
           if (Number(game.north_score) < 0)
               Players.update({_id: north_id}, {$inc: {hongKongBankruptTotal: 1}});

           // Save chombo counts
           Players.update({_id: east_id}, {$inc: {hongKongChomboTotal: Number(game.eastMistakeTotal)}});
           Players.update({_id: south_id}, {$inc: {hongKongChomboTotal: Number(game.southMistakeTotal)}});
           Players.update({_id: west_id}, {$inc: {hongKongChomboTotal: Number(game.westMistakeTotal)}});
           Players.update({_id: north_id}, {$inc: {hongKongChomboTotal: Number(game.northMistakeTotal)}});

           // Save number of hands (includes chombos, do we want this?)
           Players.update({_id: east_id}, {$inc: {hongKongHandsTotal: game.hands_array_length}});
           Players.update({_id: south_id}, {$inc: {hongKongHandsTotal: game.hands_array_length}});
           Players.update({_id: west_id}, {$inc: {hongKongHandsTotal: game.hands_array_length}});
           Players.update({_id: north_id}, {$inc: {hongKongHandsTotal: game.hands_array_length}});

           // Save number of hands won
           Players.update({_id: east_id}, {$inc: {hongKongHandsWin: Number(game.eastPlayerWins)}});
           Players.update({_id: south_id}, {$inc: {hongKongHandsWin: Number(game.southPlayerWins)}});
           Players.update({_id: west_id}, {$inc: {hongKongHandsWin: Number(game.westPlayerWins)}});
           Players.update({_id: north_id}, {$inc: {hongKongHandsWin: Number(game.northPlayerWins)}});

           // Save number of points won
           Players.update({_id: east_id}, {$inc: {hongKongWinPointsTotal: Number(game.eastPlayerPointsWon)}});
           Players.update({_id: south_id}, {$inc: {hongKongWinPointsTotal: Number(game.southPlayerPointsWon)}});
           Players.update({_id: west_id}, {$inc: {hongKongWinPointsTotal: Number(game.westPlayerPointsWon)}});
           Players.update({_id: north_id}, {$inc: {hongKongWinPointsTotal: Number(game.northPlayerPointsWon)}});

           // Save number of hands lost
           Players.update({_id: east_id}, {$inc: {hongKongHandsLose: Number(game.eastPlayerLosses)}});
           Players.update({_id: south_id}, {$inc: {hongKongHandsLose: Number(game.southPlayerLosses)}});
           Players.update({_id: west_id}, {$inc: {hongKongHandsLose: Number(game.westPlayerLosses)}});
           Players.update({_id: north_id}, {$inc: {hongKongHandsLose: Number(game.northPlayerLosses)}});

           // Calculates all positions quickly
           let idMappings = { east: east_id, south: south_id, west: west_id, north: north_id };

           Players.update({ _id: idMappings[game.positions[0].wind] }, { $inc: { hongKongFirstPlaceSum: 1 }});
           Players.update({ _id: idMappings[game.positions[1].wind] }, { $inc: { hongKongSecondPlaceSum: 1 }});
           Players.update({ _id: idMappings[game.positions[2].wind] }, { $inc: { hongKongThirdPlaceSum: 1 }});
           Players.update({ _id: idMappings[game.positions[3].wind] }, { $inc: { hongKongFourthPlaceSum: 1 }});
       }
    },
});
