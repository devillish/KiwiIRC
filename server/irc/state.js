var _       = require('lodash'),
    Channel = require('./channel.js'),
    User    = require('./user.js');

// Used by several events to reference this object
var that;


var State = function (connection, client) {
    that = this;

    this.connection = connection;
    this.client = client;
    this.channels = [];
    this.users = [];
    
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
 * Each function called in the scope of the user
 */
var user_events = {
    nick: function (new_nick) {
        that.client.sendIrcCommand('nick', {server: that.connection.con_num, nick: this.nick, ident: this.ident, hostname: this.host, newnick: new_nick});
    },


    quit: function (message) {
       // Remove this user from the user array and dispose of it
        that.users = _.without(that.users, this);
        this.dispose();

        that.client.sendIrcCommand('quit', {server: that.connection.con_num, nick: this.nick, ident: this.ident, hostname: this.host, message: message});
    },


    away: function (away) {
        that.client.sendIrcCommand('away', {server: that.connection.con_num, nick: this.nick, away: away});
    }
};


// Bind each of the user_events methods to the user object
function bindUserListeners(user) {
    _.each(user_events, function (event_fn, event_name) {
        user.on(event_name, event_fn);
    });
}

function unbindUserListeners(user) {
    _.each(user_events, function (event_fn, event_name) {
        user.removeListener(event_name, event_fn);
    });
}






/*
 * Common channel events
 */
var channel_events = {   
    privmsg: function (user, message) {
        that.client.sendIrcCommand('msg', {server: that.connection.con_num, nick: user.nick, ident: user.ident, hostname: user.host, channel: this.name, msg: message});
    },
    
    notice: function (user, message) {
        that.client.sendIrcCommand('notice', {server: that.connection.con_num, nick: user.nick, ident: user.ident, hostname: user.host, target: this.name, msg: message});
    },
    
    join: function (user) {
        that.client.sendIrcCommand('join', {server: that.connection.con_num, nick: user.nick, ident: user.ident, hostname: user.host, channel: this.name});
    },
    
    part: function (user, message) {
        if (user === that.me) {
            that.channels = _.without(that.channels, this);
            this.dispose();
        }
        that.client.sendIrcCommand('part', {server: that.connection.con_num, nick: user.nick, ident: user.ident, hostname: user.host, channel: this.name, message: message});
        cleanUserList.call(that);
    },
    
    kick: function (kickee, kicker, message) {
        if (kickee === that.me) {
            that.channels = _.without(that.channels, this);
            this.dispose();
        }
        that.client.sendIrcCommand('kick', {server: that.connection.con_num, kicked: kickee.nick, nick: kicker.nick, ident: kicker.ident, hostname: kicker.host, channel: this.name, message: message});
        cleanUserList.call(that);
    },
    
    topic: function (new_topic, set_by, set_at) {
        that.client.sendIrcCommand('topic', {server: that.connection.con_num, nick: set_by.nick, channel: this.name, topic: new_topic});
    },
    
    mode: function (mode, param, set_by) {
        that.client.sendIrcCommand('mode', {server: that.connection.con_num, target: this.name, nick: set_by.nick, modes: [{mode: mode, param: param}]});
    }
};


// Bind each of the channel_events methods to the channel object
function bindChannelListeners(channel) {
    _.each(channel_events, function (event_fn, event_name) {
        channel.on(event_name, event_fn);
    });
}

function unbindChannelListeners(channel) {
    _.each(channel_events, function (event_fn, event_name) {
        channel.removeListener(event_name, event_fn);
    });
}