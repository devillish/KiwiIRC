buster.testCase("kiwi.model.Gateway", {
    setUp: function () {
        _kiwi.app = {};
        _kiwi.app.connections = {};
        _kiwi.app.connections.getByConnectionId = sinon.spy(function (n) {
            if (n === 0) {
                var stub = sinon.createStubInstance(_kiwi.model.Network);
                stub.get = function (x) {
                    if (x === 'nick') {
                        return 'testNick';
                    }
                };
                return stub;
            } else {
                return null;
            }
        });
        _kiwi.app.connections.add = sinon.spy(function () {});
        _kiwi.app.get = function (x) {
            if (x === 'base_path') {
                return '/kiwi';
            }
        };
    },
    tearDown: function () {
        delete _kiwi.app;
    },
    "parse": {
        setUp: function () {
            g = new _kiwi.model.Gateway();
        },
        tearDown: function () {
            g = undefined;
        },

        "Options": function () {
            var chantypes, network, prefix;
            chantypes = ['#', '&'];
            network = 'TestNet';
            prefix = [{symbol: '~', mode: 'q'}, {symbol: '&', mode: 'a'}, {symbol: '@', mode: 'o'}, {symbol: '+', mode:'v'}];
            g.parse('options', {options: {
                CHANTYPES: chantypes,
                NETWORK: network,
                PREFIX: prefix
            }});
            assert(g.get('channel_prefix') === '#&', "Expected channel_prefix to be '#&'");
            assert(g.get('name') === network, "Expected 'name' to be " + network);
            assert(g.get('user_prefixes') === prefix, "Expected 'user_prefixes' to be " + prefix);
        },

        "With server": function (done) {
            var cb1 = sinon.spy(function (data) {
                    assert(data.event_name === 'test');
                    assert(data.event_data.test === 'test');
                }),
                cb2 = sinon.spy(function (data) {
                    assert(data.server === 0);
                    assert(data.test === 'test');
                });
            g.on('connection:0', cb1);
            g.on('ontest', cb2);
            g.parse('test', {
                server: 0,
                test: 'test'
            });
            setTimeout(function () {
                assert(cb1.calledOnce, "Expected callback to be called once");
                assert(cb2.calledOnce, "Expected callback to be called once");
                assert(cb1.calledBefore(cb2), "Expected cb1 to be called before cb2");
                done();
            });
        },
        "Without server": function (done) {
            var cb1 = sinon.spy(function (data) {
                    assert(data.event_name === 'test');
                    assert(data.event_data.test === 'test');
                }),
                cb2 = sinon.spy(function (data) {
                    assert(data.test === 'test');
                });
            g.on('connection:0', cb1);
            g.on('ontest', cb2);
            g.parse('test', {
                test: 'test'
            });
            setTimeout(function () {
                assert(cb1.callCount === 0, "Expected callback not to be called");
                assert(cb2.calledOnce, "Expected callback to be called once");
                done();
            });
        }
    },
    "parseKiwi": {
        setUp: function () {
            g = new _kiwi.model.Gateway();
        },
        tearDown: function () {
            g = undefined;
        },
        "parseKiwi": function (done) {
            var cb, data;
            data = {
                test: true
            };
            cb = sinon.spy(function (d) {
                assert(d === data);
            });
            g.on('kiwi:test', cb);
            g.on('kiwi', cb);
            g.parseKiwi('test', data);
            setTimeout(function () {
                assert(cb.calledTwice, "Expected callback to be called twice");
                assert(cb.alwaysCalledWithExactly(data), "Expected callback to always be called with the correct data");
                done();
            }, 100);
        }
    },
    "Event handlers": {
        setUp: function () {
            g = new _kiwi.model.Gateway();
        },
        tearDown: function () {
            g = undefined;
        },
        "onmsg channel": function (done) {
            var event = {
                    server: 0,
                    nick: 'testNick2',
                    ident: 'testIdent',
                    hostname: 'testHostname',
                    channel: '#testChannel',
                    msg: 'this is a test message'
                },
                cb = sinon.spy(function (ev) {
                    assert (ev === event);
                });

            g.on('message:#testChannel', cb);
            g.on('message', cb);
            g.trigger('onmsg', event);
            setTimeout(function () {
                assert(cb.calledTwice, "Expected callback to be called twice");
                done();
            }, 100);
        },
        "onmsg pm": function (done) {
            var event = {
                    server: 0,
                    nick: 'testNick2',
                    ident: 'testIdent',
                    hostname: 'testHostname',
                    channel: 'testNick',
                    msg: 'this is a test message'
                },
                cb = sinon.spy(function (ev) {
                    assert (ev === event);
                });

            g.on('message:testNick2', cb);
            g.on('message', cb);
            g.on('pm:testNick2', cb);
            g.on('pm', cb);
            g.trigger('onmsg', event);
            setTimeout(function () {
                assert(cb.callCount === 4, "Expected callback to be called four times");
                done();
            }, 100);
        },
        "onnotice": function (done) {
            var event = {
                    server: 0,
                    from_server: false,
                    nick: 'testNick2',
                    ident: 'testident',
                    hostname: 'testHostname',
                    target: 'testNick',
                    msg: 'this is a test message'
                },
                cb = sinon.spy(function (ev) {
                    assert (ev === event);
                });

            g.on('notice:testNick', cb);
            g.on('notice', cb);
            g.trigger('onnotice', event);
            setTimeout(function () {
                assert(cb.calledTwice, "Expected callback to be called twice");
                done();
            }, 100);
        },
        "onaction": function (done) {
            var event = {
                    server: 0,
                    nick: 'testNick',
                    ident: 'testIdent',
                    hostname: 'testHostname',
                    channel: '#testChannel',
                    msg: 'this is a test message'
                },
                cb = sinon.spy(function (ev) {
                    assert (ev === event);
                });

            g.on('action:#testChannel', cb);
            g.on('action', cb);
            g.trigger('onaction', event);
            setTimeout(function () {
                assert(cb.calledTwice, "Expected callback to be called twice");
                done();
            }, 100);
        },
        "onaction pm": function (done) {
            var event = {
                    server: 0,
                    nick: 'testNick2',
                    ident: 'testIdent',
                    hostname: 'testHostname',
                    channel: 'testNick',
                    msg: 'this is a test message'
                },
                cb = sinon.spy(function (ev) {
                    assert (ev === event);
                });

            g.on('action:testNick', cb);
            g.on('action', cb);
            g.trigger('onaction', event);
            setTimeout(function () {
                assert(cb.calledTwice, "Expected callback to be called twice");
                done();
            }, 100);
        },
        "ontopic": function (done) {
            var event = {
                    server: 0,
                    nick: 'testNick',
                    channel: '#testChannel',
                    topic: 'this is a test message'
                },
                cb = sinon.spy(function (ev) {
                    assert (ev === event);
                });

            g.on('topic:#testChannel', cb);
            g.on('topic', cb);
            g.trigger('ontopic', event);
            setTimeout(function () {
                assert(cb.calledTwice, "Expected callback to be called twice");
                done();
            }, 100);
        },
        "onjoin": function (done) {
            var event = {
                    server: 0,
                    nick: 'testNick',
                    ident: 'testIdent',
                    hostname: 'testHostname',
                    channel: '#testChannel'
                },
                cb = sinon.spy(function (ev) {
                    assert (ev === event);
                });

            g.on('join:#testChannel', cb);
            g.on('join', cb);
            g.trigger('onjoin', event);
            setTimeout(function () {
                assert(cb.calledTwice, "Expected callback to be called twice");
                done();
            }, 100);
        }
    },
    "Connect": {
        setUp: function () {
            io.connect = sinon.stub(io, "connect", function () {
                return new io.Socket({
                    'auto connect': false
                });
            });
            io.Socket.prototype.disconnect = sinon.stub(io.Socket.prototype, "disconnect");
            cb1 = sinon.spy(function () {});
            g = new _kiwi.model.Gateway();
            g.parse = sinon.stub(g, "parse");
            g.parseKiwi = sinon.stub(g, "parseKiwi");
            g.connect(cb1);
        },
        tearDown: function () {
            io.Socket.prototype.disconnect.restore();
            io.connect.restore();
            cb1 = undefined;
            g = undefined;
        },
        "Connect fail": function (done) {
            var cb2, reason;
            reason = 'test reason';
            cb2 = sinon.spy(function (r) {
                assert(r.reason === reason);
            });
            g.on("connect_fail", cb2);
            g.socket.publish('connect_failed', reason);
            setTimeout(function () {
                assert(cb2.calledOnce, "Expected callback to be called once");
                assert(cb1.callCount === 0, "Expected callback not to be called");
                done();
            }, 100);
        },
        "Error": function (done) {
            var cb2, reason;
            reason = 'test reason';
            cb2 = sinon.spy(function (r) {
                assert(r.reason === reason);
            });
            g.on("connect_fail", cb2);
            g.socket.publish('error', reason);
            setTimeout(function () {
                assert(cb2.calledOnce, "Expected callback to be called once");
                assert(cb1.callCount === 0, "Expected callback not to be called");
                done();
            }, 100);
        },
        "Connecting": function (done) {
            var cb2 = sinon.spy(function () {});
            g.on("connecting", cb2);
            g.socket.publish('connecting');
            setTimeout(function () {
                assert(cb2.calledOnce, "Expected callback to be called once");
                assert(cb1.callCount === 0, "Expected callback not to be called");
                done();
            }, 100);
        },
        "Connect": function (done) {
            g.socket.publish('connect');
            setTimeout(function () {
                assert(cb1.calledOnce, "Expected callback to be called once");
                done();
            }, 100);
        },
        "Too many connections": function (done) {
            var cb2, reason;
            reason = "too_many_connections";
            cb2 = sinon.spy(function (r) {
                assert(r.reason === reason);
            });
            g.on("connect_fail", cb2);
            g.socket.publish('too_many_connections', reason);
            setTimeout(function () {
                assert(cb2.calledOnce, "Expected callback to be called once");
                assert(cb1.callCount === 0, "Expected callback not to be called");
                done();
            }, 100);
        },
        "irc": function (done) {
            var data = {
                command: 'test',
                data: {}
            };
            g.socket.publish('irc', data);
            setTimeout(function () {
                assert(g.parse.calledOnce, "Expected _kiwi.model.Gateway.parse to be called once");
                assert(g.parse.calledWith(data.command, data.data), "Expected _kiwi.model.Gateway.parse to be called with the correct arguments");
                assert(cb1.callCount === 0, "Expected callback not to be called");
                done();
            }, 100);
        },
        "kiwi": function (done) {
            var data = {
                command: 'test',
                data: {}
            };
            g.socket.publish('kiwi', data);
            setTimeout(function () {
                assert(g.parseKiwi.calledOnce, "Expected _kiwi.model.Gateway.parse to be called once");
                assert(g.parseKiwi.calledWith(data.command, data.data), "Expected _kiwi.model.Gateway.parseKiwi to be called with the correct arguments");
                assert(cb1.callCount === 0, "Expected callback not to be called");
                done();
            }, 100);
        },
        "Disconnect": function (done) {
            var cb2 = sinon.spy(function () {});
            g.on("disconnect", cb2);
            g.socket.publish('disconnect');
            setTimeout(function () {
                assert(cb2.calledOnce, "Expected callback to be called once");
                assert(cb1.callCount === 0, "Expected callback not to be called");
                done();
            }, 100);
        },
        "Reconnecting": function (done) {
            var cb2, delay, attempts;
            delay = 30;
            attempts = 2;
            cb2 = sinon.spy(function (obj) {
                assert(obj.delay === delay);
                assert(obj.attempts === attempts);
            });
            g.on("reconnecting", cb2);
            g.socket.publish('reconnecting', delay, attempts);
            setTimeout(function () {
                assert(cb2.calledOnce, "Expected callback to be called once");
                assert(cb1.callCount === 0, "Expected callback not to be called");
                done();
            }, 100);
        }
    },
    "newConnection": {
        setUp: function () {
            var n = _kiwi.model.Network;
            io.connect = sinon.stub(io, "connect", function () {
                return new io.Socket({
                    'auto connect': false
                });
            });
            io.Socket.prototype.emit = sinon.stub(io.Socket.prototype, "emit", function (command, data, callback) {
                if (data.nick === 'error') {
                    callback(true);
                } else {
                    callback(false, 1);
                }
            });
            _kiwi.model.Network = sinon.stub(_kiwi.model, "Network", function (o) {
                return sinon.createStubInstance(n);
            });
            cb1 = sinon.spy(function () {});
            g = new _kiwi.model.Gateway();
            g.connect(cb1);
        },
        tearDown: function () {
            _kiwi.model.Network.restore();
            io.Socket.prototype.emit.restore();
            io.connect.restore();
            cb1 = undefined;
            g = undefined;
        },
        "newConnection": function () {
            var cb = sinon.spy(function (err, connection) {
                assert(!err);
                assert(_kiwi.app.connections.add.calledOnce, "Expected _kiwi.app.connections.add to be called once");
                assert(_kiwi.app.connections.add.calledWith(connection), "Expected _kiwi.app.connections.add to be called with the right connection");
            });
            g.newConnection({
                nick: 'testNick',
                hostname: 'testHost',
                port: 1337,
                ssl: false,
                password: 'testPassword'
            }, cb);
        },
        "newConnection with error": function () {
            var cb = sinon.spy(function (err, connection) {
                assert(err);
            });
            g.newConnection({
                nick: 'error',
                hostname: 'testHost',
                port: 1337,
                ssl: false,
                password: 'testPassword'
            }, cb);
        }
    },
    "sendData": {
        setUp: function () {
            g = new _kiwi.model.Gateway();
            g.socket = {
                emit: sinon.spy(function (command, data, callback) {
                    callback(false);
                })
            };
        },
        tearDown: function () {
            g = undefined;
        },
        "sendData": function () {
            var cb = sinon.spy(function () {});
            var data = {
                method: 'test',
                args: {
                    test: 'test'
                }
            };
            g.sendData(0, data, cb);
            assert(cb.calledOnce, "Expected callback to be called once");
            assert(g.socket.emit.calledWith('irc', sinon.match(function (value) {
                return ((value.server === 0) && (value.data === JSON.stringify(data)));
            })), "Expected emit to be called with the correct data");
        },
        "helpers": {
            setUp: function () {
                g.sendData = sinon.stub(g, "sendData", function (a,b,c) {
                    if (c) {
                        c();
                    }
                });
            },
            "privmsg": function () {
                var cb = sinon.spy(function () {});

                g.privmsg(0, '#testChan', 'this is a test message', cb);
                assert(cb.calledOnce, "Expected callback to be called once");
                assert(g.sendData.calledOnce, "Expected sendData to be called once");
                assert(g.sendData.calledWith(0, sinon.match(function (value) {
                    return ((value.method === 'privmsg') &&
                            (value.args.target === '#testChan') &&
                            (value.args.msg === 'this is a test message'));
                })), "Expected sendData to be called with the correct data");
            },
            "notice": function () {
                var cb = sinon.spy(function () {});

                g.notice(0, '#testChan', 'this is a test message', cb);
                assert(cb.calledOnce, "Expected callback to be called once");
                assert(g.sendData.calledOnce, "Expected sendData to be called once");
                assert(g.sendData.calledWith(0, sinon.match(function (value) {
                    return ((value.method === 'notice') &&
                            (value.args.target === '#testChan') &&
                            (value.args.msg === 'this is a test message'));
                })), "Expected sendData to be called with the correct data");
            },
            "ctcp": function () {
                var cb = sinon.spy(function () {});

                g.ctcp(0, true, 'ACTION', '#testChan', 'this is a test message', cb);
                assert(cb.calledOnce, "Expected callback to be called once");
                assert(g.sendData.calledOnce, "Expected sendData to be called once");
                assert(g.sendData.calledWith(0, sinon.match(function (value) {
                    return ((value.method === 'ctcp') &&
                            (value.args.request = true) &&
                            (value.args.type === 'ACTION') &&
                            (value.args.target === '#testChan') &&
                            (value.args.params === 'this is a test message'));
                })), "Expected sendData to be called with the correct data");
            },
            "action": function () {
                var cb = sinon.spy(function () {});

                g.action(0, '#testChan', 'this is a test message', cb);
                assert(cb.calledOnce, "Expected callback to be called once");
                assert(g.sendData.calledOnce, "Expected sendData to be called once");
                assert(g.sendData.calledWith(0, sinon.match(function (value) {
                    return ((value.method === 'ctcp') &&
                            (value.args.request = true) &&
                            (value.args.type === 'ACTION') &&
                            (value.args.target === '#testChan') &&
                            (value.args.params === 'this is a test message'));
                })), "Expected sendData to be called with the correct data");
            },
            "join": function () {
                var cb = sinon.spy(function () {});

                g.join(0, '#testChan', 'testKey', cb);
                assert(cb.calledOnce, "Expected callback to be called once");
                assert(g.sendData.calledOnce, "Expected sendData to be called once");
                assert(g.sendData.calledWith(0, sinon.match(function (value) {
                    return ((value.method === 'join') &&
                            (value.args.channel === '#testChan') &&
                            (value.args.key === 'testKey'));
                })), "Expected sendData to be called with the correct data");
            },
            "part": function () {
                var cb = sinon.spy(function () {});

                g.part(0, '#testChan', cb);
                assert(cb.calledOnce, "Expected callback to be called once");
                assert(g.sendData.calledOnce, "Expected sendData to be called once");
                assert(g.sendData.calledWith(0, sinon.match(function (value) {
                    return ((value.method === 'part') &&
                            (value.args.channel === '#testChan'));
                })), "Expected sendData to be called with the correct data");
            },
            "topic": function () {
                var cb = sinon.spy(function () {});

                g.topic(0, '#testChan', 'testTopic', cb);
                assert(cb.calledOnce, "Expected callback to be called once");
                assert(g.sendData.calledOnce, "Expected sendData to be called once");
                assert(g.sendData.calledWith(0, sinon.match(function (value) {
                    return ((value.method === 'topic') &&
                            (value.args.channel === '#testChan') &&
                            (value.args.topic === 'testTopic'));
                })), "Expected sendData to be called with the correct data");
            },
            "kick": function () {
                var cb = sinon.spy(function () {});

                g.kick(0, '#testChan', 'testNick', 'testReason', cb);
                assert(cb.calledOnce, "Expected callback to be called once");
                assert(g.sendData.calledOnce, "Expected sendData to be called once");
                assert(g.sendData.calledWith(0, sinon.match(function (value) {
                    return ((value.method === 'kick') &&
                            (value.args.channel === '#testChan') &&
                            (value.args.nick === 'testNick') &&
                            (value.args.reason === 'testReason'));
                })), "Expected sendData to be called with the correct data");
            },
            "quit": function () {
                var cb = sinon.spy(function () {});

                g.quit(0, 'this is a test message', cb);
                assert(cb.calledOnce, "Expected callback to be called once");
                assert(g.sendData.calledOnce, "Expected sendData to be called once");
                assert(g.sendData.calledWith(0, sinon.match(function (value) {
                    return ((value.method === 'quit') &&
                            (value.args.message === 'this is a test message'));
                })), "Expected sendData to be called with the correct data");
            },
            "raw": function () {
                var cb = sinon.spy(function () {});

                g.raw(0, 'testData', cb);
                assert(cb.calledOnce, "Expected callback to be called once");
                assert(g.sendData.calledOnce, "Expected sendData to be called once");
                assert(g.sendData.calledWith(0, sinon.match(function (value) {
                    return ((value.method === 'raw') &&
                            (value.args.data === 'testData'));
                })), "Expected sendData to be called with the correct data");
            },
            "changeNick": function () {
                var cb = sinon.spy(function () {});

                g.changeNick(0, 'testNick', cb);
                assert(cb.calledOnce, "Expected callback to be called once");
                assert(g.sendData.calledOnce, "Expected sendData to be called once");
                assert(g.sendData.calledWith(0, sinon.match(function (value) {
                    return ((value.method === 'nick') &&
                            (value.args.nick === 'testNick'));
                })), "Expected sendData to be called with the correct data");
            },
            "kiwi": function () {
                var cb = sinon.spy(function () {});

                g.kiwi(0, 'testNick', 'testData', cb);
                assert(cb.calledOnce, "Expected callback to be called once");
                assert(g.sendData.calledOnce, "Expected sendData to be called once");
                assert(g.sendData.calledWith(0, sinon.match(function (value) {
                    return ((value.method === 'kiwi') &&
                            (value.args.target === 'testNick') &&
                            (value.args.data === 'testData'));
                })), "Expected sendData to be called with the correct data");
            }
        }
    }
});