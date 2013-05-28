buster.testCase("kiwi.model.Applet", {
	setUp: function () {
		_kiwi.view.Applet = sinon.stub(_kiwi.view, "Applet");
		_kiwi.view.Panel.prototype.$el = $();
		_kiwi.applets = {};
		_kiwi.gateway = {get: function () {return '#';}};
	},
	tearDown: function () {
		_kiwi.view.Applet.restore();
		delete _kiwi.gateway;
	},

	"Is an Applet": function () {
		var a = new _kiwi.model.Applet({name: "test applet"});
		assert(a.applet);
		assert(a.isApplet());
	},

	"Is not a Channel": function () {
		var a = new _kiwi.model.Applet({name: "test applet"});
		assert(!a.isChannel());
	},

	"Is not a Query": function () {
		var a = new _kiwi.model.Applet({name: "test applet"});
		assert(!a.isQuery());
	},

	"is not a Server": function () {
		var a = new _kiwi.model.Applet({name: "test applet"});
		assert(!a.isServer());
	},

	"Can register applets": function () {
		var obj = {};
		_kiwi.model.Applet.register("test", obj);
		assert(_kiwi.applets["test"] === obj);
	}
});