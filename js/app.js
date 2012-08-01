/* Models */
window.Todo = Backbone.Model.extend();
window.List = Backbone.Collection.extend({
    model: Todo
});

/* Views */
window.AppView = Backbone.View.extend({
    initialize: function() {
        console.log('Initializing app');
        this.addView = new AddView();

        this.listView = new ListView({collection: new List()});


        this.render();
    },

    el: 'body',

    render: function() {
        $(this.el).append(this.addView.render().el);
        $(this.el).append(this.listView.render().el);

    }
});

window.ListView = Backbone.View.extend({
    tagName: 'ul',
    initialize: function() {
        this.collection.bind('add', function() {
            window.console.log('tried to add new element');
            window.console.log(arguments[0]);
        }, this);
    },
    render: function() {
        return this;
    },

    insert: function(todoItem) {
        this.collection.add(todoItem);
    }
});

window.TodoView = Backbone.View.extend({
    initialize: function() {
        this.template = _.template(tpl.get('todo'));
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
        // Update the Todos list column with a new element
        // which list column is that?

        window.console.log('adding new todo');
        window.app.listView.insert({title: 'foooooop'});
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

/* Eventual wrapper class.
ListView = function(name) {
    return new Backbone.View.extend({
        initialize: function() {
            this.template = _.template(tpl.get('list'));
        },

        render: function() {
            var header = '.head';
            $(this.el).html(this.template);
            $(this.el + ' ' + header).html(this.title);
            return this;
        },
        title: name
    });
}
*/
(function($) {
    $(function() {
        tpl.loadTemplates(['add', 'list'],
            function() {
                window.app = new AppView();
            }
        )
    });
})(jQuery);


// what needs to happen now:

// jslint!!!
// test!!!