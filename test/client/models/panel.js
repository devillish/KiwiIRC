buster.testCase("kiwi.model.Panel", {
	setUp: function () {
		_kiwi.global.settings = sinon.stub(_kiwi.global.settings);
		_kiwi.global.settings.get = function () {};
		_kiwi.app = sinon.stub(_kiwi.app);
		_kiwi.view.Panel = sinon.stub(_kiwi.view, "Panel");
		_kiwi.view.Panel.prototype.render = function () {};
	},
	tearDown: function () {
		delete _kiwi.global.settings;
		delete _kiwi.app;
		_kiwi.view.Panel.restore();
	},

	"addMsg": function (done) {
		var panel, sb;

		panel = new _kiwi.model.Panel({name: 'test'});

		panel.bind('msg', function (obj) {
			assert(obj.msg === 'this is a test message');
			assert(obj.nick === 'testnick');
			assert(obj.chan === 'test');
			assert(obj.type === 'msg');
			assert(obj.style === '');
			sb = panel.get("scrollback");
			assert(sb[sb.length - 1] === obj);
			done();
		});

		panel.addMsg('testnick', 'this is a test message', 'msg');

	},

	"clearMessages": function () {
		var panel, sb;
		panel = new _kiwi.model.Panel();
		panel.addMsg('testnick', 'this is a test message', 'msg');
		sb = panel.get("scrollback");
		assert(sb[sb.length -1].msg === 'this is a test message');
		panel.clearMessages();
		sb = panel.get("scrollback");
		assert(sb.length === 1);
		assert(sb[sb.length -1].msg === 'Window cleared');
	}
});