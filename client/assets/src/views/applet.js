var Panel = require('./panel.js');

module.exports = Panel.extend({
    className: 'panel applet',
    initialize: function (options) {
        this.initializePanel(options);
    }
});