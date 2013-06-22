module.exports = Backbone.View.extend({
    events: {
        'click .settings': 'clickSettings'
    },

    initialize: function () {
    },

    clickSettings: function (event) {
        _kiwi.app.controlbox.processInput('/settings');
    }
});