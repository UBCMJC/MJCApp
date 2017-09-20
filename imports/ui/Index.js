// Orphaned html files
import './static/About.html';
import './static/Home.html';
import './Index.html';

import './games/HongKongNewGame';
import './games/JapaneseNewGame';
import './ranking/Ranking';

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
