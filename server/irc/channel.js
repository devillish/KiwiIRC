var events  = require('events'),
    util    = require('util'),
    _       = require('lodash');

var Channel = function (name, connection) {
    events.EventEmitter.call(this);
    this.name = name;
    this.members = [];
    this.topic = '';
    this.topic_details = {set_by: null, set_at: 0};
    
    this.expecting_names = false;
    
    // Set up modes
    this.modes = Object.create(null);
    this.modes.prefix_modes = Object.create(null);
    // Modes such as qohv etc (contains Users)
    connection.options.PREFIX.forEach(function (prefix) {
        this.modes.prefix_modes[prefix.mode] = [];
    }, this);
    // Modes such as beI etc. (contains masks, always has a parameter)
    connection.options.CHANMODES[0].split('').forEach(function (mode) {
        this.modes[mode] = [];
    }, this);
    // Modes such as k (always has a parameter)
    connection.options.CHANMODES[1].split('').forEach(function (mode) {
        this.modes[mode] = false;
    }, this);
    // Modes such as l (only has a parameter when set)
    connection.options.CHANMODES[2].split('').forEach(function (mode) {
        this.modes[mode] = false;
    }, this);
    // Modes such as mnt etc. (does not have a parameter)
    connection.options.CHANMODES[3].split('').forEach(function (mode) {
        this.modes[mode] = false;
    }, this);
};

util.inherits(Channel, events.EventEmitter);

Channel.prototype.hasMember = function (user) {
    return _.contains(this.members, user);
};

Channel.prototype.removeMember = function (user) {
    if (this.hasMember(user)) {
        for (var mode in this.modes.prefix_modes) {
            this.modes.prefix_modes[mode] = _.without(this.modes.prefix_modes[mode], user);
        }
        return (this.members = _.without(this.members, user));
    } else {
        return this.members;
    }
};

Channel.prototype.addMember = function (user) {
    if (!this.hasMember(user)) {
        this.members.push(user);
        user.once('quit', function () {
            removeOnQuit.call(this, user);
        }.bind(this));
    }
};

var removeOnQuit = function (user) {
    this.removeMember(user);
};

Channel.prototype.privmsg = function (user, message) {
    this.emit('privmsg', user, message);
};

Channel.prototype.notice = function (user, message) {
    this.emit('notice', user, message);
};

Channel.prototype.join = function (user) {
    if (!this.hasMember(user)) {
        this.addMember(user);
        this.emit('join', user);
    }
};

Channel.prototype.part = function (user, message) {
    if (this.hasMember(user)) {
        this.removeMember(user);
        this.emit('part', user, message);
    }
};

Channel.prototype.kick = function (kickee, kicker, reason) {
    if (this.hasMember(kickee)) {
        this.removeMember(kickee);
        this.emit('kick', kickee, kicker, reason);
    }
};

Channel.prototype.setTopic = function (new_topic, set_by) {
    this.topic = new_topic;
    this.topic_details.set_by = set_by;
    this.topic_details.set_at = Date.now();
    this.emit('topic', new_topic, set_by, this.topic_details.set_at);
};

Channel.prototype.mode = function (modes, set_by) {
    modes.forEach(function (mode) {
        var param = mode.param;
        mode = mode.mode;
        var add = (mode[0] === '+');
        if (typeof this.modes.prefix_modes[mode[1]] !== 'undefined') {
            if (add) {
                this.modes.prefix_modes[mode[1]].push(param);
            } else {
                this.modes.prefix_modes[mode[1]] = _.without(this.modes.prefix_modes[mode[1]], param);
            }
        } else if (typeof this.modes[mode[1]] !== 'undefined') {
            if (add) {
                if (_.isArray(this.modes[mode[1]])) {
                    this.modes[mode[1]].push(param);
                } else {
                    this.modes[mode[1]] = param || true;
                }
            } else {
                if (_.isArray(this.modes[mode[1]])) {
                    this.modes[mode[1]] = _.without(this.modes[mode[1]], param);
                } else {
                    this.modes[mode[1]] = false;
                }
            }
        } else {
            return;
        }
        this.emit('mode', mode, param, set_by);
    }, this);
};

Channel.prototype.dispose = function () {
    this.members = null;
    this.modes = null;
    this.removeAllListeners();
};

module.exports = Channel;
