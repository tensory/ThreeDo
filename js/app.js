/* Models */
window.Todo = Backbone.Model.extend({
    defaults: {
        title: 'Untitled'
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

        this.totalCounter = new TotalCounterView({ model: [] });

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
                    'id': rawName + 'List',
                    'data-name': rawName
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

        this.counter = new CounterView({ model: [ this.collection ] });

        $(this.el).on('dragstart', function(event) {
            var modelId = current._getDraggableModelId(event);
            var dragged = current.collection.getByCid(modelId);
            window.app.draggableModel = dragged;
            current.collection.remove(dragged);
        });

        this.collection.on('add', function(todo, collection, options) {
            // Give the item an id manually, since no create event is doing that
            var todoModel = _.extend(todo, {
                id: 'task_' + todo.cid,
                attributes: {
                    'data-cid': todo.cid,
                    'data-origin': $(current.el).attr('data-name'),
                    'title': todo.get('title')
                }
            });
            var task = new TodoView(todoModel);
            $(current.el).append($(task.el));
        });
    },

    render: function() {
        this._generateOriginSelectors();
        var current = this;
        var droppableArgs = {
            drop: function(event, ui) {
                if (window.app.draggableModel) {
                    // Add it to our collection
                    current.collection.add(window.app.draggableModel);

                    // Reset the header on the LI that was dropped
                    // to correctly signal origin.
                    if ($(event.srcElement).attr('data-origin')) {
                        // Allow dropping onto self
                        $(event.toElement).attr('data-origin', current.attributes['data-name']);
                    }

                    window.app.draggableModel = null; // reset
                }
            },
            accept: this._generateOriginSelectors(),
            over: function() {
                // Make the drop zone bigger
                var height = $(current.el).height();
                $(current.el).css('height', height + current.minElementHeight + 'px');
            },
            out: function() {
                // Return drop zone to its default height
                $(current.el).css('height', current.collection.models.length * current.minElementHeight + 'px');
            }
        };
        $(this.el).droppable(droppableArgs);
        return this;
    },

    insert: function(todoItem) {
        this.collection.add(todoItem);
    },

    minElementHeight: 60,

    _getDraggableModelId: function(event) {
        var idAttr = 'data-cid';

        if (!($(event.target).attr(idAttr))) {
            return undefined;
        }

        return $(event.target).attr(idAttr);
    },

    _generateOriginSelectors: function() {

        var columnRules = this.rules[$(this.el).attr('data-name')],
            selectors = [],
            selectorString = 'li[data-origin="%"]';

        _.each(columnRules, function(origin) {
            selectors.push(selectorString.replace('%', origin));
        });

        return selectors.join(', ');
    },

    rules: {
        'todo' : ['todo', 'in-process'],
        'in-process' : ['todo', 'in-process', 'done'],
        'done' : ['in-process', 'done']
    }
});

window.CounterView = Backbone.View.extend({
    initialize: function() {
        var current = this;

        if (this.model.length) {
            _.each(this.model, function(source) {
                source.bind('add', current.update, current);
                source.bind('remove', current.update, current);
            });

            this.update();
        }
    },

    render: function() {
        this.template = _.template(tpl.get('counter'), {
            number: this.count
        });

        $(this.el).html(this.template);
        return this;
    },

    update: function() {
        this._setTotal();
        this.render();
    },

    _setTotal: function() {
        var total = 0;
        _.each(this.model, function(source) {
            total += source.length;
        });
        this.count = total;
    },

    count: 0
});

window.TotalCounterView = _.extend(window.CounterView, {
    initialize: function() {
        return this;
    },

    render: function() {
        alert(this.count);
    },

    update: function() {
        this.count++;
        this.render();
    },

    _setTotal: undefined,

    count: 0
});

window.TodoView = Backbone.View.extend({
    title: '',
    tagName: 'li',
    attributes: {
        'data-origin': ''
    },
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
        var inputId = '#todo-title';
        if ($(this.template).find(inputId).val().length < 1) {
            $(inputId).addClass('error');
        } else {
            $(inputId).removeClass('error');
            window.app.totalCounter.update();
            window.app.lists.todoListView.insert({ title: $(inputId).val() });
        }
        return this;
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
            window.console.log('Loading template: ' + name);
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

                $('#add').trigger('click'); // for testing only
            });
    });
})(jQuery);