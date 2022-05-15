import './static/About.html';
import './Index.html';

import './home/Home';
import './record-game/RecordHongKongGame';
import './record-game/RecordJapaneseGame';
import './ranking/Ranking';

Template.Index.onCreated( function() {
    if (localStorage.getItem("game_id") !== null) {
        if (localStorage.getItem("game_type") === "jp") {
            this.currentTab = new ReactiveVar( "RecordJapaneseGame" );
        } else if (localStorage.getItem("game_type") === "hk") {
            this.currentTab = new ReactiveVar( "RecordHongKongGame" );
        }
    } else {
        this.currentTab = new ReactiveVar( "Home" );
    }
});

Template.Index.onRendered( function() {
    $("#" + this.currentTab.curValue).addClass( "active" );
});

Template.Index.helpers({
    tab() {
        return Template.instance().currentTab.get();
    },
});

Template.Index.events({
    'click .nav-tabs li'( event, template ) {
        // Prevent dropdown menus from being selectable,
        // but maintain their clickiness
        var currentTab = $( event.target ).closest( "li" );

        if (currentTab.data("template") === undefined)
            return;

        currentTab.addClass( "active" );
        $( ".nav-tabs li" ).not( currentTab ).removeClass( "active" );

        template.currentTab.set( currentTab.data( "template" ) );
    }
});
