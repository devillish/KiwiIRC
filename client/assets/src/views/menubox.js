_kiwi.view.MenuBox = Backbone.View.extend({
    events: {
        'click .ui_menu_foot .close': 'dispose',
        'keydown': 'keyDown'
    },

    attributes: {
        tabindex: 0
    },

    initialize: function(title) {
        var that = this;

        this.$el = $('<div class="ui_menu" tabindex="-1" role="dialog"></div>');

        this._title = title || '';
        this._items = {};
        this._display_footer = true;
        this._close_on_blur = true;
    },


    render: function() {
        var that = this;

        this.$el.find('*').remove();

        if (this._title) {
            $('<div id="ui_menu_title" class="ui_menu_title" tabindex="-1"></div>')
                .text(this._title)
                .appendTo(this.$el);
        }


        _.each(this._items, function(item) {
            var $item = $('<div class="ui_menu_content hover" tabindex="-1" aria-label="Menu content"></div>')
                .append(item);

            that.$el.append($item);
        });

        if (this._display_footer)
            this.$el.append('<div class="ui_menu_foot" tabindex="-1" aria-label="Menu footer"><a class="close" tabindex="-1" onclick="">Close <i class="icon-remove"></i></a></div>');
    },


    onDocumentClick: function(event) {
        var $target = $(event.target);

        if (!this._close_on_blur)
            return;

        // If this is not itself AND we don't contain this element, dispose $el
        if ($target[0] != this.$el[0]) {
            if (this.$el.has($target).length === 0) {
                this.dispose();
            }
        } else {
            return false;
        }
    },


    dispose: function() {
        _.each(this._items, function(item) {
            item.dispose && item.dispose();
            item.remove && item.remove();
        });

        this._items = null;
        this.remove();

        if (this._close_proxy)
            $(document).off('click', this._close_proxy);
    },


    addItem: function(item_name, $item) {
        $item = $($item);
        if ($item.is('a')) $item.addClass('icon-chevron-right');
        this._items[item_name] = $item;
    },


    removeItem: function(item_name) {
        delete this._items[item_name];
    },


    showFooter: function(show) {
        this._display_footer = show;
    },


    closeOnBlur: function(close_it) {
        this._close_on_blur = close_it;
    },


    show: function(container) {
        var that = this;

        this.render();
        if (!container) {
            this.$el.appendTo(_kiwi.app.view.$el);
        } else {
            this.$el.appendTo(container);
        }

        // We add this document click listener on the next javascript tick.
        // If the current tick is handling an existing click event (such as the nicklist click handler),
        // the click event bubbles up and hits the document therefore calling this callback to
        // remove this menubox before it's even shown.
        setTimeout(function() {
            that._close_proxy = function(event) {
                that.onDocumentClick(event);
            };
            $(document).on('click', that._close_proxy);
        }, 0);
    },

    keyDown: function (ev) {
        console.log(ev.target);

        switch (true) {
            // Escape
        case (ev.keyCode === 27):
            this.dispose();
            return false;
            // Left
        case (ev.keyCode === 37):
            console.log('Down', $(ev.target).find('[tabindex=-1]').first());
            $(ev.target).find('[tabindex=-1]').first().focus();
            return false;
            // Right
        case (ev.keyCode === 39):
            console.log('Up', $(ev.target).parents('[tabindex]'));
            $(ev.target).parents('[tabindex]').first().focus();
            return false;
            // Down
        case (ev.keyCode === 40):
            console.log('Right', $(ev.target).next('[tabindex=-1]'));
            $(ev.target).next('[tabindex=-1]').focus();
            return false;
            // Up
        case (ev.keyCode === 38):
            console.log('Left', $(ev.target).prev('[tabindex=-1]'));
            $(ev.target).prev('[tabindex=-1]').focus();
            return false;
            // Enter or space
        case ((ev.keyCode === 13) || (ev.keyCode === 32)):
            $(ev.target).click();
            return false;
        }
    }
});