var events  = require('events'),
    util    = require('util');

var User = function (nick, ident, host, real_name) {
    events.EventEmitter.call(this);
    
    this.nick = nick;
    this.ident = ident || '';
    this.host = host || '';
    this.real_name = real_name || '';
    this.away = false;
};

util.inherits(User, events.EventEmitter);

User.prototype.setNick = function (new_nick) {
    if (this.nick !== new_nick) {
        this.emit('nick', new_nick);
        this.nick = new_nick;
    }
};

User.prototype.setIdent = function (new_ident) {
    if (this.ident !== new_ident) {
        this.ident = new_ident;
        this.emit('ident', new_ident);
    }
};

User.prototype.setHost = function (new_host) {
    if (this.host !== new_host) {
        this.host = new_host;
        this.emit('host', new_host);
    }
};

User.prototype.setRealName = function (new_real_name) {
    if (this.real_name !== new_real_name) {
        this.real_name = new_real_name;
        this.emit('real_name', new_real_name);
    }
};

User.prototype.setAway = function (away) {
    if (this.away !== away) {
        this.emit('away', away);
        this.away = away;
    }
};

User.prototype.quit = function (message) {
    this.emit('quit', message);
};

User.prototype.dispose = function () {
    this.removeAllListeners();
};

module.exports = User;
