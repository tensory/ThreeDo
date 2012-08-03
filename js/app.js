/* Models */
window.Todo = Backbone.Model.extend({
    defaults: {
        title: 'Untitled',
    }
});

window.List = Backbone.Collection.extend({
    model: Todo
});

window.Counter = Backbone.Model.extend({
    dataSources: []
});

/* Views */
window.AppView = Backbone.View.extend({
    initialize: function() {
        console.log('Initializing app');
        this.addView = new AddView();

        this.lists = {};
        _.extend(this.lists, this._createListViews(this.columnNames));
        // By this point, window.app.lists.todoListView MUST exist in order for 'add' to work!

        this.totalCounter = new CounterView({
            model: new Counter({ dataSources: _.values(this.lists) })
        });

        this.render();
    },

    el: 'body',

    render: function() {
        // todo: DRY
        $(this.el).append(this.addView.render().el);
        $(this.el).append(this.totalCounter.render().el);
        var self = this;

        // Add container for all 3 lists
        var listsContainer = $(tpl.get('lists'));
        $(this.el).append(listsContainer);

        // Add empty lists to columns
        // Wow this is gross. Clean it up.
        _.each(this.columnNames, function(col) {
            var list = self.lists[utils.camelCase(col) + 'ListView'].render().el,
                listContainer = $(listsContainer).find('div[data-label="' + col + '"]');
            listContainer.find('h1').after(self.lists[utils.camelCase(col) + 'ListView'].counter.render().el);
            listContainer.append(list);
        });
        return this;
    },

    // Generate ListView objects for the 3 main columns used by the app view
    _createListViews: function(names) {
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

    columnNames: ['todo', 'in-process', 'done'],
    draggableModel: null
});

window.ListView = Backbone.View.extend({
    tagName: 'ul',
    initialize: function() {
        var current = this;

        this.counter = new CounterView({ model: new Counter({ dataSources: [this.el] }) });

        $(this.el).on('dragstart', function(event) {
            var modelId = current._getDraggableModelId(event);
            var dragged = current.collection.getByCid(modelId);
            window.app.draggableModel = dragged;
            current.collection.remove(dragged);
        });

        this.collection.on('add', function(todo, collection, options) {
            // Track the index
            window.console.log('tried to add new element at position ' + options.index);

            // Give the item an id manually, since no create event is doing that
            var todoModel = _.extend(todo, {
                id: 'task_' + todo.cid,
                attributes: {
                    'data-cid': todo.cid,
                    'title': todo.get('title')
                }
            });
            var task = new TodoView(todoModel);
            $(current.el).append($(task.el));

            window.app.totalCounter.update();
        });
    },

    render: function() {
        var current = this;
        var droppableArgs = {
            drop: function(event, ui) {
                if (window.app.draggableModel) {
                    current.collection.add(window.app.draggableModel);
                    window.app.draggableModel = null; // reset
                }
            }
        }
        $(this.el).droppable(droppableArgs);
        return this;
    },

    insert: function(todoItem) {
        this.collection.add(todoItem);
    },

    _getDraggableModelId: function(event) {
        var idAttr = 'data-cid';

        if (!($(event.target).attr(idAttr))) {
            return null;
        }

        return $(event.target).attr(idAttr);
    }
});

window.CounterView = Backbone.View.extend({
    attributes: {
        class: 'counter'
    },

    initialize: function() {
        this._setTemplate(this._getCountFromSources());
    },

    render: function() {
        $(this.el).html($(this.template));
        return this;
    },

    update: function() {
        this._setTemplate(this._getCountFromSources());
        this.render();
    },

    _setTemplate: function(count) {
        this.template = _.template(tpl.get('counter'),
            {
                number: count
            }
        );
    },

    // Get the count from all the data sources this instance of Counter knows about
    _getCountFromSources: function() {
        var count = 0;
        _.each(this.model.get('dataSources'), function(view) {
            count += $(view.el).children('li').length;
        });
        return count;
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
            revert: 'invalid',
            helper: 'clone',
            start: function(event) {
                $(this).detach();
            }
        };
        $(this.el).html(_.template(tpl.get('todo'), { todoTitle: this.attributes.title }));
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
        window.app.lists.todoListView.insert({title: 'New Todo'});
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

var dragged = null;

// Runner
(function($) {
    $(function() {
        tpl.loadTemplates(['add', 'todo', 'counter', 'lists'],
            function() {
                window.app = new AppView();

               // $('#add').trigger('click'); // for testing only
            });
    });
})(jQuery);