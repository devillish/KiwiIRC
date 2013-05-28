var config = module.exports;

config["Client tests"] = {
    rootPath: '..',
    environment: "browser",
    libs: [
        "client/assets/libs/jquery-1.9.1.min.js",
        "client/assets/libs/lodash.min.js",
        "client/assets/libs/backbone.min.js",
        "node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js"
    ],
    sources: [
        'client/assets/src/app.js',
        'client/assets/src/models/application.js',
        'client/assets/src/models/gateway.js',
        'client/assets/src/models/newconnection.js',
        'client/assets/src/models/panellist.js',
        'client/assets/src/models/networkpanellist.js',
        'client/assets/src/models/panel.js',
        'client/assets/src/models/member.js',
        'client/assets/src/models/memberlist.js',
        'client/assets/src/models/network.js',
        'client/assets/src/models/query.js',
        'client/assets/src/models/channel.js',
        'client/assets/src/models/server.js',
        'client/assets/src/models/applet.js',
        'client/assets/src/applets/*.js',
        'client/assets/src/models/pluginmanager.js',
        'client/assets/src/models/datastore.js',
        'client/assets/src/helpers/utils.js',
        'client/assets/src/views/panel.js',
        'client/assets/src/views/*.js'
    ],
    tests: ["test/client/**/*.js"]
};

config["Server tests"] = {
    rootPath: '..',
    environment: "node",
    tests: ["test/server/**/*.js"]
};