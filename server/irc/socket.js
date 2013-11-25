/**
*   The IrcSocket object abstracts over the three types of outgoing sockets that we use:
*   SOCKS proxy sockets (provided by socksjs), TLS sockets and regular cleartext TCP sockets.
*
*   IrcSocket is a Duplex Stream (streams2).
*/

var net     = require('net'),
    tls     = require('tls'),
    dns     = require('dns'),
    util    = require('util'),
    stream  = require('stream'),
    _       = require('lodash'),
    Socks;

// Break the Node.js version down into usable parts
var version_values = process.version.substr(1).split('.').map(function (item) {
    return parseInt(item, 10);
});

// If this version of node is older than 0.10.x, bring in the streams2 shim
if (version_values[0] === 0 && version_values[1] < 10) {
    stream = require('readable-stream');
// If this version of node is newer than 0.10.x, bring in the Socks module
} else {
    Socks = require('socksjs');
}

function IrcSocket(options) {
    stream.Duplex.call(this);

    options = _.defaults(options, {
        host: 'localhost',
        port: 6667,
        ssl: false,
        rejectUnauthorized: false,
        socks: false,
    });

    this.socket = null;
    this._paused = false;

    connect.call(this, options);
}

util.inherits(IrcSocket, stream.Duplex);

module.exports = IrcSocket;

IrcSocket.prototype._read = function() {
    if (this._paused) {
        this.socket.resume();
        this._paused = false;
    }
};

IrcSocket.prototype._write = function(chunk, encoding, callback) {
    this.socket.write(chunk, encoding, callback);
};

IrcSocket.connect = function (options, listener) {
    var irc_socket = new IrcSocket(options);
    if (typeof listener === 'function') {
        irc_socket.once('connect', listener);
    }
    return irc_socket;
};

function connect(options) {
    var that = this,
        socket_connect_event_name = 'connect',
        dest_addr = options.socks ? options.socks.host : options.host;

    getConnectionFamily(dest_addr, function getConnectionFamilyCb(err, family, host) {
        var outgoing;
        if (err) {
            return that.emit('error', err);
        }

        if (options.outgoing_interface) {
            if ((family === 'IPv6') && (options.outgoing_interface.IPv6)) {
                outgoing = global.config.outgoing_interface.IPv6;
            } else {
                outgoing = global.config.outgoing_interface.IPv4 || '0.0.0.0';

                // We don't have an IPv6 interface but dest_addr may still resolve to
                // an IPv4 address. Reset `host` and try connecting anyway, letting it
                // fail if an IPv4 resolved address is not found
                host = dest_addr;
            }

            // If we have an array of interfaces, select a random one
            if (typeof outgoing !== 'string' && outgoing.length) {
                outgoing = outgoing[Math.floor(Math.random() * outgoing.length)];
            }

            // Make sure we have a valid interface address
            if (typeof outgoing !== 'string') {
                outgoing = '0.0.0.0';
            }
        } else {
            outgoing = '0.0.0.0';
        }

        // Are we connecting through a SOCKS proxy?
        if (options.socks) {
            if (Socks) {
                that.socket = Socks.connect({
                    host: options.host,
                    port: options.port,
                    ssl: options.ssl,
                    rejectUnauthorized: options.rejectUnauthorized
                }, {host: options.socks.host,
                    port: options.socks.port,
                    user: options.socks.user,
                    pass: options.socks.pass,
                    localAddress: outgoing
                });
            } else {
                that.emit('error', 'Trying to connect via a SOCKS proxy but the socksjs module is not available');
            }
        } else {
            // No socks connection, connect directly to the IRCd
            if (options.ssl) {
                that.socket = tls.connect({
                    host: options.host,
                    port: options.port,
                    rejectUnauthorized: options.rejectUnauthorized,
                    localAddress: outgoing
                });

                // We need the raw socket connect event
                that.socket.socket.on('connect', function() { rawSocketConnect.call(that, this); });

                socket_connect_event_name = 'secureConnect';
            } else {
                that.socket = net.connect({
                    host: options.host,
                    port: options.port,
                    localAddress: outgoing
                });
            }
        }

        // Apply the socket listeners
        that.socket.on(socket_connect_event_name, function socketConnectCb() {
            // TLS sockets have already called this
            if (!options.ssl) {
                rawSocketConnect.call(that, this);
            }

            that.emit('connect');
        });

        that.socket.on('error', function socketErrorCb(event) {
            that.emit('error', event);
        });

        that.socket.once('data', function (data) {
            var pause;
            // Avoid pushing null as that ends the stream.
            if (data !== null) {
                // if push returns false, pause the socket
                pause = !that.push(data);
                if (pause) {
                    that.socket.pause();
                    that._paused = true;
                }
            }
        });

        that.socket.on('close', function socketCloseCb(had_error) {
            that.connected = false;

            // Remove this socket form the identd lookup
            if (that.identd_port_pair) {
                delete global.clients.port_pairs[that.identd_port_pair];
            }

            that.emit('close', had_error);
        });

        that.socket.on('end', function socketEndCb() {
            that.push(null);
        });
    });
}

function getConnectionFamily(host, callback) {
    if (net.isIP(host)) {
        if (net.isIPv4(host)) {
            callback(null, 'IPv4', host);
        } else {
            callback(null, 'IPv6', host);
        }
    } else {
        dns.resolve6(host, function resolve6Cb(err, addresses) {
            if (!err) {
                callback(null, 'IPv6', addresses[0]);
            } else {
                dns.resolve4(host, function resolve4Cb(err, addresses) {
                    if (!err) {
                        callback(null, 'IPv4',addresses[0]);
                    } else {
                        callback(err);
                    }
                });
            }
        });
    }
}

/**
 * When a socket connects to an IRCd
 * May be called before any socket handshake are complete (eg. TLS)
 */
function rawSocketConnect(socket) {
    // Make note of the port numbers for any identd lookups
    // Nodejs < 0.9.6 has no socket.localPort so check this first
    if (typeof socket.localPort !== 'undefined') {
        this.identd_port_pair = socket.localPort.toString() + '_' + socket.remotePort.toString();
        global.clients.port_pairs[this.identd_port_pair] = this;
    }
}
