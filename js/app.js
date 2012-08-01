window.AppView = Backbone.View.extend({
    initialize: function() {
        console.log('Initializing app');
    }
});

window.AddView = Backbone.View.extend({
    events: {
        'click #add': "newToDo"
    },

    newToDo: function() {
        window.console.log('adding new todo');
    }
});

(function($) {
    $(function() {
        new AppView();
    });
})(jQuery);