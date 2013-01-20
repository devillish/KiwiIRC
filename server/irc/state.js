var _       = require('lodash'),
    Channel = require('./channel.js'),
    User    = require('./user.js');

var State = function (connection, client) {
    this.connection = connection;
    this.client = client;
    this.channels = [];
    this.users = [];
    
    // Stores the listeners created by .bind() so that they can be unbound at a later date
    this.bound_listeners = Object.create(null);
    
    // Create the client user
    this.me = new User(this.connection.nick, this.connection.username, this.client.real_address);
    this.users.push(this.me);

    // If we change nick, update the connection itself
    this.me.on('nick', function (new_nick) {
        connection.nick = new_nick;
    });
};


// Add a channel to our state
State.prototype.addChannel = function (name) {
    var chan = new Channel(name, this.connection);
    bindChannelListeners.call(this, chan);
    chan.join(this.me);
    this.channels.push(chan);
};


// Find a channel by its name
State.prototype.getChannel = function (name) {
    return _.find(this.channels, function (c) {
        return c.name === name;
    });
};


// Find a user by its nick. If not found, create it
State.prototype.getUser = function (nick, ident, host, real_name) {
    var user = _.find(this.users, function (u) {
        return u.nick === nick;
    });

    if (!user) {
        user = new User(nick, ident, host, real_name);
        this.users.push(user);

        // Add the listeners to this user
        bindUserListeners.call(this, user);
    }
    
    return user;
};



// Re-generate the user array from the channels
var cleanUserList = function () {
    var chan_member_lists = [[this.me]];
    this.channels.forEach(function (chan) {
        chan_member_lists.push(chan.members);
    });

    // Call the _.union method with the 
    this.users = _.union.apply(_, chan_member_lists);
};

module.exports = State;












/*
 * Common user events
 */
var user_events = {
    nick: function (user, new_nick) {
        this.client.sendIrcCommand('nick', {server: this.connection.con_num, nick: user.nick, ident: user.ident, hostname: user.host, newnick: new_nick});
    },


    quit: function (user, message) {
       // Remove this user from the user array and dispose of it
        this.users = _.without(this.users, user);
        user.dispose();

        this.client.sendIrcCommand('quit', {server: this.connection.con_num, nick: user.nick, ident: user.ident, hostname: user.host, message: message});
    },


    away: function (user, away) {
        this.client.sendIrcCommand('away', {server: this.connection.con_num, nick: user.nick, away: away});
    }
};


// Bind each of the user_events methods to the user object
function bindUserListeners(user) {
    var that = this;
    _.each(user_events, function (event_fn, event_name) {
        var bound_listener = event_fn.bind(that, user);
        that.bound_listeners[event_name] = bound_listener;
        user.on(event_name, bound_listener);
    });
}

function unbindUserListeners(user) {
    var that = this;
    _.each(user_events, function (event_fn, event_name) {
        user.removeListener(event_name, that.bound_listeners[event_name]);
    });
}






/*
 * Common channel events
 */
var channel_events = {   
    privmsg: function (channel, user, message) {
        this.client.sendIrcCommand('msg', {server: this.connection.con_num, nick: user.nick, ident: user.ident, hostname: user.host, channel: channel.name, msg: message});
    },
    
    notice: function (channel, user, message) {
        this.client.sendIrcCommand('notice', {server: this.connection.con_num, nick: user.nick, ident: user.ident, hostname: user.host, target: channel.name, msg: message});
    },
    
    join: function (channel, user) {
        this.client.sendIrcCommand('join', {server: this.connection.con_num, nick: user.nick, ident: user.ident, hostname: user.host, channel: channel.name});
    },
    
    part: function (channel, user, message) {
        if (user === this.me) {
            this.channels = _.without(this.channels, channel);
            channel.dispose();
        }
        this.client.sendIrcCommand('part', {server: this.connection.con_num, nick: user.nick, ident: user.ident, hostname: user.host, channel: channel.name, message: message});
        cleanUserList.call(this);
    },
    
    kick: function (channel, kickee, kicker, message) {
        if (kickee === this.me) {
            this.channels = _.without(this.channels, channel);
            channel.dispose();
        }
        this.client.sendIrcCommand('kick', {server: this.connection.con_num, kicked: kickee.nick, nick: kicker.nick, ident: kicker.ident, hostname: kicker.host, channel: channel.name, message: message});
        cleanUserList.call(this);
    },
    
    topic: function (channel, new_topic, set_by, set_at) {
        this.client.sendIrcCommand('topic', {server: this.connection.con_num, nick: set_by.nick, channel: channel.name, topic: new_topic});
    },
    
    mode: function (channel, mode, param, set_by) {
        this.client.sendIrcCommand('mode', {server: this.connection.con_num, target: channel.name, nick: set_by.nick, modes: [{mode: mode, param: param}]});
    }
};


// Bind each of the channel_events methods to the channel object
function bindChannelListeners(channel) {
    var that = this;
    _.each(channel_events, function (event_fn, event_name) {
        var bound_listener = event_fn.bind(that, channel);
        that.bound_listeners[event_name] = bound_listener;
        channel.on(event_name, bound_listener);
    });
}

function unbindChannelListeners(channel) {
    var that = this;
    _.each(channel_events, function (event_fn, event_name) {
        channel.removeListener(event_name, that.bound_listeners[event_name]);
    });
}