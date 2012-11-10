var events  = require('events'),
    util    = require('util');

var User = function (nick, ident, host) {
    events.EventEmitter.call(this);
    
    this.nick = nick;
    this.ident = ident || '';
    this.host = host || '';
    this.away = false;
};

util.inherits(User, events.EventEmitter);

User.prototype.setNick = function (new_nick) {
    this.emit('nick', new_nick);
    this.nick = new_nick;
};

User.prototype.setIdent = function (new_ident) {
    this.ident = new_ident;
    this.emit('ident', new_ident);
};

User.prototype.setHost = function (new_host) {
    this.host = new_host;
    this.emit('host', new_host);
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
