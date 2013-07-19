// Model for this = _kiwi.model.NetworkPanelList
_kiwi.view.NetworkTabs = Backbone.View.extend({
    tagName: 'ul',
    className: 'connections',
    attributes: {
        role: "tree"
    },

    initialize: function() {
        this.model.on('add', this.networkAdded, this);
        this.model.on('remove', this.networkRemoved, this);

        this.$el.appendTo($('#kiwi .tabs'));
    },

    networkAdded: function(network) {
        $('<li class="connection" role="treeitem"></li>')
            .append(network.panels.view.$el)
            .appendTo(this.$el);
    },

    networkRemoved: function(network) {
        network.panels.view.remove();

        _kiwi.app.view.doLayout();
    }
});