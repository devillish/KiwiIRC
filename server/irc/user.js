var EventBinder  = require('./eventbinder.js');

var IrcUser = function (irc_commands, nick, clientEvent) {
    this.irc_commands = irc_commands;
    this.nick = nick;
    this.clientEvent = clientEvent;

    this.irc_events = {
        nick:           onNick,
        away:           onAway,
        quit:           onQuit,
        whoisuser:      onWhoisUser,
        whoisaway:      onWhoisAway,
        whoisoperator:  onWhoisOperator,
        whoischannels:  onWhoisChannels,
        whoismodes:     onWhoisModes,
        whoisidle:      onWhoisIdle,
        whoisregnick:   onWhoisRegNick,
        whoisserver:    onWhoisServer,
        whoishost:      onWhoisHost,
        whoissecure:    onWhoisSecure,
        whoisaccount:   onWhoisAccount,
        endofwhois:     onWhoisEnd,
        whowas:         onWhoWas,
        endofwhowas:    onWhoWasEnd,
        wasnosuchnick:  onWasNoSuchNick,
        notice:         onNotice,
        ctcp_response:  onCtcpResponse,
        privmsg:        onPrivmsg,
        ctcp_request:   onCtcpRequest,
        mode:           onMode
    };
    EventBinder.bindIrcEvents('user ' + this.nick, this.irc_events, this, this.irc_commands);
};


module.exports = IrcUser;


IrcUser.prototype.dispose = function () {
    EventBinder.unbindIrcEvents('user ' + this.nick, this.irc_events, this.irc_commands);
    this.irc_commands = undefined;
};


function onNick(event) {
    this.clientEvent('nick', {
        nick: event.nick,
        ident: event.ident,
        hostname: event.hostname,
        newnick: event.newnick,
        time: event.time
    });

    // TODO: uncomment when using an IrcUser per nick
    //EventBinder.unbindIrcEvents('user ' + this.nick, this.irc_events, irc_commands);
    //this.nick = event.newnick;
    //EventBinder.bindIrcEvents('user ' + this.nick, this.irc_events, this, irc_commands);
}

function onAway(event) {
    this.clientEvent('away', {
        nick: event.nick,
        msg: event.msg,
        time: event.time
    });
}

function onQuit(event) {
    this.clientEvent('quit', {
        nick: event.nick,
        ident: event.ident,
        hostname: event.hostname,
        message: event.trailing,
        time: event.time
    });
}

function onWhoisUser(event) {
    this.clientEvent('whois', {
        nick: event.nick,
        ident: event.ident,
        host: event.host,
        msg: event.msg,
        end: false
    });
}

function onWhoisAway(event) {
    this.clientEvent('whois', {
        nick: event.nick,
        away_reason: event.reason,
        end: false
    });
}

function onWhoisServer(event) {
    this.clientEvent('whois', {
        nick: event.nick,
        irc_server: event.irc_server,
        server_info: event.server_info,
        end: false
    });
}

function onWhoisOperator(event) {
    this.clientEvent('whois', {
        nick: event.nick,
        msg: event.msg,
        end: false
    });
}

function onWhoisChannels(event) {
    this.clientEvent('whois', {
        nick: event.nick,
        chans: event.chans,
        end: false
    });
}

function onWhoisModes(event) {
    this.clientEvent('whois', {
        nick: event.nick,
        msg: event.msg,
        end: false
    });
}

function onWhoisIdle(event) {
    this.clientEvent('whois', {
        nick: event.nick,
        idle: event.idle,
        logon: event.logon || undefined,
        end: false
    });
}

function onWhoisRegNick(event) {
    this.clientEvent('whois', {
        nick: event.nick,
        msg: event.msg,
        end: false
    });
}

function onWhoisHost(event) {
    this.clientEvent('whois', {
        nick: event.nick,
        msg: event.msg,
        end: false
    });
}

function onWhoisSecure(event) {
    this.clientEvent('whois', {
        nick: event.nick,
        msg: 'Using a secure connection',
        end: false
    });
}

function onWhoisAccount(event) {
    this.clientEvent('whois', {
        nick: event.nick,
        msg: 'Logged in as ' + event.account,
        end: false
    });
}

function onWhoisEnd(event) {
    this.clientEvent('whois', {
        nick: event.nick,
        msg: event.msg,
        end: true
    });
}

function onWhoWas(event) {
    this.clientEvent('whowas', {
        nick: event.nick,
        ident: event.user,
        host: event.host,
        real_name: event.real_name,
        end: false
    });
}

function onWasNoSuchNick(event) {
    this.clientEvent('whowas', {
        nick: event.nick,
        end: false
    });
}

function onWhoWasEnd(event) {
    this.clientEvent('whowas', {
        nick: event.nick,
        end: true
    });
}

function onNotice(event) {
    this.clientEvent('notice', {
        from_server: event.from_server,
        nick: event.nick,
        ident: event.ident,
        hostname: event.hostname,
        target: event.target,
        msg: event.msg,
        time: event.time
    });
}

function onCtcpResponse(event) {
    this.clientEvent('ctcp_response', {
        nick: event.nick,
        ident: event.ident,
        hostname: event.hostname,
        channel: event.channel,
        msg: event.msg,
        time: event.time
    });
}

function onPrivmsg(event) {
    this.clientEvent('msg', {
        nick: event.nick,
        ident: event.ident,
        hostname: event.hostname,
        channel: event.channel,
        msg: event.msg,
        time: event.time
    });
}

function onCtcpRequest(event) {
    this.clientEvent('ctcp_request', {
        nick: event.nick,
        ident: event.ident,
        hostname: event.hostname,
        target: event.target,
        type: event.type,
        msg: event.msg,
        time: event.time
    });
}

function onMode(event) {
    this.clientEvent('mode', {
        target: event.target,
        nick: event.nick,
        modes: event.modes,
        time: event.time
    });
}
