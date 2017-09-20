FlowRouter.route('/', {
    action: function() {
        BlazeLayout.render('Base', { body: 'Index' });
    }
});

FlowRouter.route('/admin', {
    action: function() {
        BlazeLayout.render('Base', { body: 'Admin' });
    }
});