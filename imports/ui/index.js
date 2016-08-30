Template.index.onCreated( function() {
	this.current_tab = new ReactiveVar( "home" );
});

Template.index.helpers({
	tab() {
		return Template.instance().current_tab.get();
	},
});

Template.index.events({
	'click .nav-tabs li'( event, template ) {
		// Prevent dropdown menus from being selectable, but maintain their clickiness
		if ($( event.target ).attr( 'class' ) == "dropdown-toggle" )
			return;

		var current_tab = $( event.target ).closest( "li" );

		current_tab.addClass( "active" );
		$( ".nav-tabs li" ).not( current_tab ).removeClass( "active" );

		template.current_tab.set( current_tab.data( "template" ) );
	}
});