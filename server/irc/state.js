var _       = require('underscore'),
    Channel = require('./channel.js'),
    User    = require('./user.js');

var State = function (connection, client) {
    this.connection = connection;
    this.client = client;
    this.channels = [];
    this.users = [];
    
    this.me = new User(this.connection.nick, this.connection.username, this.client.real_address);
    this.me.on('nick', function (new_nick) {
        connection.nick = new_nick;
    });
    this.users.push(this.me);
};

State.prototype.addChannel = function (name) {
    var chan = new Channel(name, this.connection);
    bindChannelListeners.call(this, chan);
    chan.join(this.me);
    this.channels.push(chan);
};

State.prototype.getChannel = function (name) {
    return _.find(this.channels, function (c) {
        return c.name === name;
    });
};

State.prototype.getUser = function (nick, ident, host) {
    var user = _.find(this.users, function (u) {
        return u.nick === nick;
    });
    if (!user) {
        user = new User(nick, ident, host);
        bindUserListeners.call(this, user);
        this.users.push(user);
    }
    
    return user;
};

bindUserListeners = function (user) {
    var that = this;
    user.on('nick', function (new_nick) {
        that.client.sendIrcCommand('nick', {server: that.connection.con_num, nick: user.nick, ident: user.ident, hostname: user.host, newnick: new_nick});
    });
    
    user.on('quit', function (message) {
        that.users = _.without(that.users, this);
        this.removeAllListeners();
        that.client.sendIrcCommand('quit', {server: that.connection.con_num, nick: user.nick, ident: user.ident, hostname: user.host, message: message});
    });
    
    user.on('away', function (message) {
        that.client.sendIrcCommand('away', {server: that.connection.con_num, nick: user.nick, away: away, message: message});
    });
};

var bindChannelListeners = function (chan) {
    var that = this;
    
    chan.on('privmsg', function (user, message) {
        that.client.sendIrcCommand('msg', {server: that.connection.con_num, nick: user.nick, ident: user.ident, hostname: user.host, channel: this.name, msg: message});
    });
    
    chan.on('notice', function (user, message) {
        that.client.sendIrcCommand('notice', {server: that.connection.con_num, nick: user.nick, ident: user.ident, hostname: user.host, target: this.name, msg: message});
    });
    
    chan.on('join', function (user) {
        that.client.sendIrcCommand('join', {server: that.connection.con_num, nick: user.nick, ident: user.ident, hostname: user.host, channel: this.name});
    });
    
    chan.on('part', function (user, message) {
        if (user === that.me) {
            that.channels = _.without(that.channels, this);
            this.dispose();
        }
        that.client.sendIrcCommand('part', {server: that.connection.con_num, nick: user.nick, ident: user.ident, hostname: user.host, channel: this.name, message: message});
        cleanUserList.call(that);
    });
    
    chan.on('kick', function (kickee, kicker, message) {
        if (kickee === that.me) {
            that.channels = _.without(that.channels, this);
            this.dispose();
        }
        that.client.sendIrcCommand('kick', {server: that.connection.con_num, kicked: kickee.nick, nick: kicker.nick, ident: kicker.ident, hostname: kicker.host, channel: this.name, message: message});
        cleanUserList.call(that);
    });
    
    chan.on('topic', function (new_topic, set_by, set_at) {
        that.client.sendIrcCommand('topic', {server: that.connection.con_num, nick: set_by.nick, channel: this.name, topic: new_topic});
    });
    
    chan.on('mode', function (mode, param, set_by) {
        console.log(arguments);
        that.client.sendIrcCommand('mode', {server: that.connection.con_num, target: this.name, nick: set_by.nick, modes: [{mode: mode, param: param}]});
    });
};

var cleanUserList = function () {
    var chan_member_lists = [[this.me]];
    this.channels.forEach(function (chan) {
        chan_member_lists.push(chan.members);
    });
    this.users = _.union.apply(_, chan_member_lists);
};

module.exports = State;
