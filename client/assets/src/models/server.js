var PanelView = require('../views/panel.js'),
    PanelModel = require('./panel.js');

module.exports =  PanelModel.extend({
    // Used to determine if this is a server panel
    server: true,

    initialize: function (attributes) {
        var name = "Server";
        this.view = new PanelView({"model": this, "name": name});
        this.set({
            "scrollback": [],
            "name": name
        }, {"silent": true});

        //this.addMsg(' ', '--> Kiwi IRC: Such an awesome IRC client', '', {style: 'color:#009900;'});
    }
});