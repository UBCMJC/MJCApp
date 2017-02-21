// Orphaned html files
import './About.html';
import './Home.html';
import './Index.html';

import './HongKongNewGame.js';
import './JapaneseNewGame.js';
import './ranking/Ranking.js';

Template.Index.onCreated( function() {
	this.currentTab = new ReactiveVar( "Home" );
});

Template.Index.helpers({
	tab() {
		return Template.instance().currentTab.get();
	},
});

Template.Index.events({
	'click .nav-tabs li'( event, template ) {
		// Prevent dropdown menus from being selectable, but maintain their clickiness
		if ($( event.target ).attr( 'class' ) == "dropdown-toggle" )
			return;

		var currentTab = $( event.target ).closest( "li" );

		currentTab.addClass( "active" );
		$( ".nav-tabs li" ).not( currentTab ).removeClass( "active" );

		template.currentTab.set( currentTab.data( "template" ) );
	}
});
