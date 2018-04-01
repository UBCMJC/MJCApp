import './AmericanRanking.html';

Template.AmericanRanking.events({
    'click .player1': (event) => {
	event.preventDefault();
	$("#modal1").modal('show');
    },
    'click .player2': (event) => {
	event.preventDefault();
	$("#modal2").modal('show');
    },
    'click .player3': (event) => {
	event.preventDefault();
	$("#modal3").modal('show');
    },
    'click .player4': (event) => {
	event.preventDefault();
	$("#modal4").modal('show');
    }
});
