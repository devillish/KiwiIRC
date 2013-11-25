var events          = require('events'),
    util            = require('util'),
    IrcConnection   = require('./connection.js'),
    IrcCommands     = require('./commands.js'),
    IrcServer       = require('./server.js'),
    IrcUser         = require('./user.js'),
    IrcChannel      = require('./channel.js'),
    EventBinder     = require('./eventbinder.js');

function ConnectionState(options, client_event_handler) {
    var that = this;
    events.EventEmitter.call(this);

    this.client_event_handler = client_event_handler;

    if (global.config.socks_proxy && global.config.socks_proxy.enabled) {
        options.socks = {
            host: global.config.socks_proxy.address,
            port: global.config.socks_proxy.port,
            user: global.config.socks_proxy.user,
            pass: global.config.socks_proxy.pass
        };
    }

    this.options = options;

    this.irc_connection = new IrcConnection(this.options);
    this.irc_commands = new IrcCommands(this, this.irc_connection, this.client_event_handler);

    this.irc_channels = Object.create(null);
    this.irc_users = Object.create(null);

    bindEventHandlers.call(this);
    this.irc_connection.on('msg', function (command, msg) {
        that.irc_commands.dispatch(command, msg);
    });
    this.irc_connection.on('connected', function () {
        that.emit('connected');
    });
    this.irc_connection.on('close', function (had_err) {
        that.emit('close', had_err);
    });
    this.irc_connection.on('error', function () {
        that.emit.call(that, 'error', arguments);
    });
}

util.inherits(ConnectionState, events.EventEmitter);
module.exports = ConnectionState;

ConnectionState.prototype.dispose = function() {
    var that = this;
    EventBinder.unbindIrcEvents('', this.irc_events, this, this.irc_commands);
    this.irc_server.dispose();
    delete this.irc_server;
    this.irc_users.forEach(function (irc_user, idx) {
        irc_user.dispose();
        delete that.irc_users[idx];
    });
    delete this.irc_users;
    this.irc_commands.removeAllListeners();
    delete this.irc_commands;
    this.irc_connection.dispose();
};

ConnectionState.prototype.connect = function() {
    this.irc_connection.connect();
};

function bindEventHandlers() {
    // Listen for events on the IRC connection
    this.irc_events = {
        'server * connect':  onServerConnect,
        'channel * join':    onChannelJoin,

        // TODO: uncomment when using an IrcUser per nick
        //'user:*:privmsg':    onUserPrivmsg,
        'user * nick':       onUserNick,
        'channel * part':    onUserParts,
        'channel * quit':    onUserParts,
        'channel * kick':    onUserKick
    };

    EventBinder.bindIrcEvents('', this.irc_events, this, this.irc_commands);

    this.irc_server = new IrcServer(this.irc_commands, this.client_event_handler);
    // TODO: use `this.nick` instead of `'*'` when using an IrcUser per nick
    this.irc_users[this.options.nick] = new IrcUser(this.irc_commands, '*', this.client_event_handler);
}

function onChannelJoin(event) {
    var chan;

    // Only deal with ourselves joining a channel
    if (event.nick !== this.options.nick) {
        return;
    }

    // We should only ever get a JOIN command for a channel
    // we're not already a member of.. but check we don't
    // have this channel in case something went wrong somewhere
    // at an earlier point
    if (!this.irc_channels[event.channel]) {
        chan = new IrcChannel(this.irc_commands, event.channel, this.client_event_handler);
        this.irc_channels[event.channel] = chan;
        chan.irc_events.join.call(chan, event);
    }
}

function onServerConnect(event) {
    this.options.nick = this.irc_connection.nick = event.nick;
}


function onUserPrivmsg(event) {
    var user;

    // Only deal with messages targetted to us
    if (event.channel !== this.options.nick) {
        return;
    }

    if (!this.irc_users[event.nick]) {
        user = new IrcUser(this.irc_commands, event.nick, this.client_event_handler);
        this.irc_users[event.nick] = user;
        user.irc_events.privmsg.call(user, event);
    }
}


function onUserNick(event) {
    // Only deal with messages targetted to us
    if (event.nick !== this.options.nick) {
        return;
    }

    this.options.nick = this.irc_connection.nick = event.newnick;
}


function onUserParts(event) {
    // Only deal with ourselves leaving a channel
    if (event.nick !== this.options.nick) {
        return;
    }

    if (this.irc_channels[event.channel]) {
        this.irc_channels[event.channel].dispose();
        delete this.irc_channels[event.channel];
    }
}

function onUserKick(event){
    // Only deal with ourselves being kicked from a channel
    if (event.kicked !== this.options.nick) {
        return;
    }

    if (this.irc_channels[event.channel]) {
        this.irc_channels[event.channel].dispose();
        delete this.irc_channels[event.channel];
    }

}
