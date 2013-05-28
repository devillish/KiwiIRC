buster.testCase("kiwi.model.Member", {
	setUp: function () {
		_kiwi.view.Member = sinon.stub(_kiwi.view, "Member");
		_kiwi.gateway = sinon.stub(_kiwi.gateway);
		_kiwi.gateway.get = function (v) {
			if (v === 'user_prefixes')
				return [{symbol: '~', mode: 'q'}, {symbol: '&', mode: 'a'}, {symbol: '@', mode: 'o'}, {symbol: '+', mode:'v'}];
		};
	},
	tearDown: function () {
		_kiwi.view.Member.restore();
		delete _kiwi.gateway;
	},

	"Default nick": function () {
		var m = new _kiwi.model.Member({nick: "testnick"});
		assert(m.get("nick") === 'testnick');
	},

	"Default modes": function () {
		var m = new _kiwi.model.Member({nick: "testnick", "modes": ['v']});
		assert(m.get("modes").length === 1);
		assert(m.get("modes")[0] === 'v');
	},

	"Mode ordering": function () {
		var m = new _kiwi.model.Member({nick: "testnick", "modes": ['v', 'q']});
		assert(m.get("modes").length === 2);
		assert(m.get("modes")[0] === 'q');
		assert(m.get("modes")[1] === 'v');
	},

	"Add mode": function () {
		var m = new _kiwi.model.Member({nick: "testnick"});
		assert(m.get("modes").length === 0);
		m.addMode('o');
		assert(m.get("modes").length === 1);
		assert(m.get("modes")[0] === 'o');
	},

	"Remove mode": function () {
		var m = new _kiwi.model.Member({nick: "testnick", "modes": ['a']});
		assert(m.get("modes").length === 1);
		assert(m.get("modes")[0] === 'a');
		m.removeMode('a');
		assert(m.get("modes").length === 0);
	},

	"Get Prefix": function () {
		var m = new _kiwi.model.Member({nick: "testnick", "modes": ['a']});
		assert(m.getPrefix('a') === '&');
	},

	"Strip prefix": function () {
		var m = new _kiwi.model.Member({nick: "testnick", "modes": ['a']});
		assert(m.stripPrefix('&nick') === 'nick');
	},

	"Display Nick": function () {
		var m = new _kiwi.model.Member({nick: "testnick", "modes": ['a']});
		m.set("ident", "test");
		m.set("hostname", "test");
		assert(m.displayNick() === 'testnick');
		assert(m.displayNick(true) === 'testnick [test@test]');
	},

	"isOp": function () {
		var m = new _kiwi.model.Member({nick: "testnick", "modes": ['v']});
		assert(!m.get('is_op'));
		m.removeMode('v');
		assert(!m.get('is_op'));
		m.addMode('o');
		assert(m.get('is_op'));
		m.removeMode('o');
		assert(!m.get('is_op'));
		m.addMode('a');
		assert(m.get('is_op'));
		m.removeMode('a');
		assert(!m.get('is_op'));
		m.addMode('q');
		assert(m.get('is_op'));
	}

});