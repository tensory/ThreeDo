/* Models */
window.Todo = Backbone.Model.extend({
    defaults: {
        title: 'Untitled'
    }
});

window.List = Backbone.Collection.extend({
    model: Todo
});

/* Views */
window.AppView = Backbone.View.extend({
    initialize: function() {
        console.log('Initializing app');
        this.addView = new AddView();
        this.listsView = new ListsView();

        this.render();

        var firstColumn = new ListView( { collection: new List() });

    },


    el: 'body',
    column: '',
    render: function() {
        // todo: DRY
        $(this.el).append(this.addView.render().el);
        $(this.el).append(this.listsView.render().el);

        // First list panel is the 'To Do' side.
        var first = $('#to_do ul').get(0);
        window.console.log(first);

    }
});

/*
   ListsView is the renderer for all Lists (3, in this case)
   while ListView renders just one list.
 */
window.ListsView = Backbone.View.extend({
    initialize: function() {
        this.template = _.template(tpl.get('lists'));
    },

    id: 'lists',

    render: function() {
        $(this.el).html(this.template);
        this.setListViews();
        return this;
    },

    lists: [],

    setListViews: function() {
        var containers = $(this.el).find('.list');
        _.each(containers, function(element) {
            var v = new ListView( { collection: new List() });
            $(element).append(v.render().el);
        });
    },

    // Init collection of Lists.
    getTodoList: function() {
        var containers = $(this.el).find('.list'),
            list = new ListView({ collection: new List() });

        /*
        _.each(containers, function(element) {
            window.console.log(element);
            var listUlView = new ListView( { collection: new List() });
            self.lists.push(listUlView);
            $(element).append(listUlView.render().el);
            //$(element).append(new ListView().render().el);
            //window.console.log(new ListView( { collection: new List() }));

        });
        //window.console.log($(this.el).find('.list'));
        return self.lists;
    }

   */
    }
});

window.ListView = Backbone.View.extend({
    tagName: 'ul',
    initialize: function() {
        var current = this;
        this.collection.on('add', function(todo, collection, options) {
            // Track the index
            window.console.log('tried to add new element at position ' + options.index);
            window.console.log(todo.get('title'))

            var task = new TodoView(todo.get('title'));
            $(current.el).append($(task.el));
        });
    },
    render: function() {
        return this;
    },

    insert: function(todoItem) {
        this.collection.add(todoItem);
    }
});

window.TodoView = Backbone.View.extend({
    title: '',
    initialize: function(title) {
        this.title = title;
        this.render();
    },
    render: function() {
        // This template expects a title variable.
        var params = {
            todoTitle: this.title
        };
        $(this.el).append(_.template(tpl.get('todo'), params));
        return this;
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
        'click #add': "addToDo"
    },
    addToDo: function() {
        // Delegate the list adding action to the ListView
        window.console.log(window.app.column.insert);
        //window.app.column.insert({title: 'New Todo'});
    }
});

// Template loader by C. Coenraets.
// https://github.com/ccoenraets/backbone-directory/blob/master/jquerymobile/js/utils.js
var tpl = {
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
        tpl.loadTemplates(['add', 'todo', 'lists'],
            function() {
                window.app = new AppView();
            }
        )
    });
})(jQuery);

// Next: show data