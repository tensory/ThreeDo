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

        _.extend(this, this.createListViews(this.columnNames));
        // By this point, window.app.todoListView MUST exist in order for 'add' to work!

        this.render();
    },

    el: 'body',

    render: function() {
        // todo: DRY
        $(this.el).append(this.addView.render().el);
        var self = this;

        // Add container for all 3 lists
        var listsContainer = $(tpl.get('lists'));
        $(this.el).append(listsContainer);

        // Add empty lists to columns
        _.each(this.columnNames, function(col) {
            var list = self[utils.camelCase(col) + 'ListView'].render().el;
            $(listsContainer).find('div[data-label="' + col + '"]').append(list);
        });
        return this;
    },

    // Generate ListView objects for the 3 main columns used by the app view
    createListViews: function(names) {
        var lists = {};
        _.each(names, function(rawName) {
            var camelCasedName = utils.camelCase(rawName) + 'ListView';
            lists[camelCasedName] = new ListView({
                collection: new List(),
                attributes: {
                    id: rawName + 'List'
                }
            });
        });

        return lists;
    },

    columnNames: ['todo', 'in-process', 'done']
});

window.ListView = Backbone.View.extend({
    tagName: 'ul',
    initialize: function() {
        var current = this;
        window.console.log('droppable?');

        this.collection.on('add', function(todo, collection, options) {
            // Track the index
            window.console.log('tried to add new element at position ' + options.index);

            var task = new TodoView(todo.get('title'));
            $(current.el).append($(task.el));
        });
    },
    render: function() {
        var droppableArgs = {
            drop: function(event, ui) {
                window.console.log('fA');

            }
        }
        $(this.el).droppable(droppableArgs);
        return this;
    },

    insert: function(todoItem) {
        this.collection.add(todoItem);
    }
});

window.TodoView = Backbone.View.extend({
    title: '',
    tagName: 'li',
    initialize: function(title) {
        this.title = title;
        this.render();
    },
    render: function() {
        var draggableOptions = {
            snap: 'ul.ui-droppable',
            snapMode: 'inner',
            revert: 'invalid'
        };

        $(this.el).html(_.template(tpl.get('todo'), { todoTitle: this.title }));
        $(this.el).draggable(draggableOptions);
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
        window.app.inProcessListView.insert({title: 'New Todo'});
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

var utils = {
    // Camel-caser is used to help generate ListView property names
    camelCase: function(string) {
        return string.replace(/(\-[a-z])/g, function(str) {
            return str.toUpperCase().replace('-','');
        });
    }
};

(function($) {
    $(function() {
        tpl.loadTemplates(['add', 'todo', 'lists'],
            function() {
                window.app = new AppView();
            }
        )
    });
})(jQuery);