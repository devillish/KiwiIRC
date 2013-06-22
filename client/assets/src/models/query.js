var Panel       = require('./panel.js'),
	ChannelView = require('../views/channel.js');

var tmp = module.exports = Panel.extend({
    initialize: function (attributes) {
        var name = this.get("name") || "",
            members;

        this.view = new ChannelView({"model": this, "name": name});
        this.set({
            "name": name,
            "scrollback": []
        }, {"silent": true});
    }
});
