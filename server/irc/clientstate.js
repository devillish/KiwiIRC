var util            = require('util'),
    events          = require('events'),
    _               = require('lodash'),
    ConnectionState = require('./connectionstate.js');

var ClientState = function (client, save_state) {
    var that = this;

    events.EventEmitter.call(this);
    this.client = client;
    this.save_state = save_state || false;

    this.connection_states = [];
    this.next_connection = 0;

    this.client.on('dispose', function () {
        if (!that.save_state) {
            _.each(that.connection_states, function (connection_state, i, cons) {
                if (connection_state && connection_state.irc_connection) {
                    connection_state.irc_connection.end('QUIT :' + (global.config.quit_message || ''));
                    global.servers.removeConnection(connection_state);
                    cons[i] = null;
                }
            });

            that.dispose();
        }
    });
};

util.inherits(ClientState, events.EventEmitter);

module.exports = ClientState;

ClientState.prototype.connect = function (hostname, port, ssl, nick, user, options, callback) {
    var that = this,
        con,
        con_num;

    // Check the per-server limit on the number of connections
    if ((global.config.max_server_conns > 0) &&
        (!global.config.restrict_server) &&
        (!(global.config.webirc_pass && global.config.webirc_pass[hostname])) &&
        (!(global.config.ip_as_username && _.contains(global.config.ip_as_username, hostname))) &&
        (global.servers.numOnHost(hostname) >= global.config.max_server_conns))
    {
        return callback('Too many connections to host', {host: hostname, limit: global.config.max_server_conns});
    }

    con_num = this.next_connection++;
    con = new ConnectionState({
        host: hostname,
        port: port,
        ssl: ssl,
        nick: nick,
        user: user,
        password: options.password,
        encoding: options.encoding,
    }, function ClientEventCb(command, data) {
        data.server = con_num;
        that.sendIrcCommand.call(that, command, data);
    });

    this.connection_states[con_num] = con;

    con.on('connected', function ConnectionStateConnection() {
        global.servers.addConnection(this);
        return callback(null, con_num);
    });

    con.on('error', function ConnectionStateError(err) {
        console.log('irc_connection error (' + hostname + '):', err);
        return callback(err.code);
    });

    con.on('close', function ConnectionStateClose() {
        // TODO: Can we get a better reason for the disconnection? Was it planned?
        that.sendIrcCommand('disconnect', {server: con.con_num, reason: 'disconnected'});

        that.connection_states[con_num] = null;
        global.servers.removeConnection(this);
    });

    // Call any modules before making the connection
    global.modules.emit('irc connecting', {connection: con.irc_connection})
        .done(function () {
            con.connect();
        });
};

ClientState.prototype.sendIrcCommand = function () {
    this.client.sendIrcCommand.apply(this.client, arguments);
};

ClientState.prototype.sendKiwiCommand = function () {
    this.client.sendKiwicommand.apply(this.client, arguments);
};

ClientState.prototype.dispose = function () {
    this.emit('dispose');
    this.removeAllListeners();
};
