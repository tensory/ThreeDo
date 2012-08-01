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

        this.todoListView = new ListView({
            collection: new List(),
            attributes: {
                id: 'todoList'
            }
        });
        this.render();
    },

    el: 'body',

    render: function() {
        // todo: DRY
        $(this.el).append(this.addView.render().el);

        // Add list container
        var listsContainer = $(tpl.get('lists'));
            /*,
            list = _.template(tpl.get('list'), {
                listContents: self.todoListView.render().el
            });
              */
        $(this.el).append(listsContainer);
        var list = $(listsContainer).append(this.todoListView.render().el);
        $(this.el).append(list);
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
        var params = {
            todoTitle: this.title
        }
        // Reassign element to container loaded from template
        $(this.el).unbind();
        this.el = _.template(tpl.get('todo'), params);
        this.delegateEvents();
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
        window.app.todoListView.insert({title: 'New Todo'});
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
        tpl.loadTemplates(['add', 'todo', 'lists'],
            function() {
                window.app = new AppView();
            }
        )
    });
})(jQuery);