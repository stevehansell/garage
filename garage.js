(function() {
	var root = this,
		Garage;

	if (typeof exports !== 'undefined') {
		Garage = exports;
	} else {
		Garage = root.Garage = {};
	}
	
	// Key to use for storing Garage tracking info
	Garage.ITEMSKEY = 'GARAGEITEMS';
	
	// Wraps localStorage.setItem
	Garage.add = function(key, value) {
		if (typeof value === 'object') value = JSON.stringify(value);
		localStorage.setItem(key, value);
		this.trigger('add', [key]);
	};
	
	// Wraps localStorage.getItem
	Garage.get = function(key) {
		return localStorage.getItem(key);
	};
	
	Garage.getJSON = function(key) {
		return JSON.parse(this.get(key));
	};
	
	// Wraps localStorage.removeItem
	Garage.remove = function(key) {
		localStorage.removeItem(key);
	};
	
	// Removes all items from localStorage
	Garage.empty = function() {
		localStorage.clear();
	};
	
	// Removes items from localStorage from a blacklist. If a blacklist
	// is not specified, it removes all items.
	Garage.clean = function() {
		if (!this.blacklistedItems || this.blacklistedItems.length === 0) {
			Garage.empty();
			return;
		}
		
		for (var i = 0; i < this.blacklistedItems.length; i++) {
			this.remove(this.blacklistedItems[i]);
		}
	};
	
	Garage.setBlacklist = function(keys) {
		this.blacklistedItems = keys;
	};
	
	Garage.addToBlacklist = function(key) {
		if (!this.blacklistedItems) {
			if (typeof key === 'string') key = [key];
			this.setBlacklist(key);
		} else {
			this.blacklistedItems.push(key);
		}
	};
	
	// Triggers events namespaced with 'garage:'. Not fully implemented
	// for cross browser functionality.
	Garage.trigger = function(evtName, args) {
		var evt = document.createEvent('Event');
		evt.initEvent('garage:'+evtName, true, true);
		evt.args = args;
		root.dispatchEvent(evt);
	};
	
	
	// Event listeners
	
	root.addEventListener('garage:add', function(e) {
		console.log(e.args, +new Date())
	});
	
	// Setup localStorage to track added items and timestamps
	if (Garage.get(Garage.ITEMSKEY) === null) {
		// Dont use Garage.add here to avoid the garage:add event
		localStorage.setItem(Garage.ITEMSKEY, undefined);
	}
	
}).call(this);