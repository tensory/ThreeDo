window.Todo = Backbone.Model.extend();

window.List = Backbone.Collection.extend({
    model: Todo
});


window.AppView = Backbone.View.extend({
    initialize: function() {
        console.log('Initializing app');
        this.addView = new AddView();

        this.render();
    },

    el: 'body',

    render: function() {
        $(this.el).html(this.addView.render().el);
    }
});

window.AddView = Backbone.View.extend({
    initialize: function() {
        this.template = _.template(tpl.get('add'));
    },

    render: function() {
        $(this.el).html(this.template);
        return this;
    },

    events: {
        'click #add': "newToDo"
    },

    newToDo: function() {
        window.console.log('adding new todo');

    }
});

// Template loader by C. Coenraets.
// https://github.com/ccoenraets/backbone-directory/blob/master/jquerymobile/js/utils.js
tpl = {
    templates: {},

    loadTemplates: function(names, callback) {
        var that = this;

        var loadTemplate = function (index) {
            var name = names[index];
            console.log('Loading template: ' + name);
            $.get('tpl/' + name + '.html', function (data) {
                that.templates[name] = data;
                index++;
                if (index < names.length) {
                    loadTemplate(index);
                } else {
                    callback();
                }
            });
        }

        loadTemplate(0);
    },
    get: function(filename) {
        return this.templates[filename];
    }
};

(function($) {
    $(function() {
        tpl.loadTemplates(['add'],
            function() {
                var app = new AppView();
            }
        )
    });
})(jQuery);