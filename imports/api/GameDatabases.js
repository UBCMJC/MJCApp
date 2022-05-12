import { Mongo } from 'meteor/mongo';

import Players from './Players';

export const HongKongHands = new Mongo.Collection('hongKongHands');
export const JapaneseHands = new Mongo.Collection('japaneseHands');
export const InProgressHongKongHands = new Mongo.Collection('inProgressHongKongHands');
export const InProgressJapaneseHands = new Mongo.Collection('inProgressJapaneseHands');

Meteor.methods({
  canRetrievePlayer: function (param) {
     return Players.find().fetch();
  },

  getInProgressJapaneseGame: function (gameId) {
     return InProgressJapaneseHands.findOne({_id: gameId});
  },

  getInProgressHongKongGame: function (gameId) {
     return InProgressHongKongHands.findOne({_id: gameId});
  },
});