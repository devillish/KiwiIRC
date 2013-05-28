buster.testCase("kiwi.model.DataStore", {
	"Default namespace is ''": function () {
		var d = new _kiwi.model.DataStore();
		assert(d.namespace() === '');
	},
	"Setting the namespace works": function () {
		var d = new _kiwi.model.DataStore();
		d.namespace('new');
		assert(d.namespace() === 'new');
	},
	"Saving and loading data works": function () {
		var d = new _kiwi.model.DataStore();
		d.set("test", "test value 1");
		assert(d.get("test") === "test value 1");
		d.save();
		d.set("test", "test value 2");
		assert(d.get("test") === "test value 2");
		d.load();
		assert(d.get("test") === "test value 1");
	},
	"instance creates and returns a new DataStore": function () {
		var d = new _kiwi.model.DataStore.instance('test');
		assert(d.namespace() === 'test');
	}
});