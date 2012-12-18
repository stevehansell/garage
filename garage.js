(function() {
	var root = this,
		Garage;

	if (typeof exports !== 'undefined') {
		Garage = exports;
	} else {
		Garage = root.Garage = {};
	}
	
	// Key to use for storing Garage tracking info
	Garage.CACHEKEY = 'GARAGEITEMS';
	
	// Default cache expiration time. Override with Garage.setCACHEEXPIRATIONDAYS
	Garage.CACHEEXPIRATIONDAYS = 7;
	
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
	
	// Get localStorage as JSON
	Garage.getJSON = function(key) {
		return JSON.parse(this.get(key));
	};
	
	// Wraps localStorage.removeItem
	Garage.remove = function(key) {
		localStorage.removeItem(key);
		this.trigger('remove', [key]);
	};
	
	// Removes all items from localStorage
	Garage.empty = function() {
		localStorage.clear();
		this._setupCache();
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
	
	// List of keys that will be deleted on Garage.clean()
	Garage.setBlacklist = function(keys) {
		this.blacklistedItems = keys;
	};
	
	// Add additional keys to the blacklist array
	Garage.addToBlacklist = function(key) {
		if (!this.blacklistedItems) {
			if (typeof key === 'string') key = [key];
			this.setBlacklist(key);
		} else {
			this.blacklistedItems.push(key);
		}
	};
	
	// Overrides the default CACHEEXPIRATIONDAYS value
	Garage.setCACHEEXPIRATIONDAYS = function(timeInDays) {
		if (typeof timeInDays === 'string') timeInDays = parseInt(timeInDays);
		this.CACHEEXPIRATIONDAYS = timeInDays;
	};
	
	// Removes all expired keys from storage
	Garage.expire = function() {
		var expTime;
		this._updateCache();
		for (key in this.cache) {
			expTime = this.cache[key];
			if (expTime < this._expirationTimeInMS()) {
				this.remove(key);
			}
		}
	};
	
	// Adds a key and timestamp to the cache property and stores in localStorage
	Garage.addToCache = function(key) {
		Garage.cache[key] = Date.now();
		localStorage.setItem(Garage.CACHEKEY, JSON.stringify(Garage.cache));
	};
	
	// Removes a key and its timestamp from the cache object and updates localStorage
	Garage.removeFromCache = function(key) {
		delete Garage.cache[key];
		localStorage.setItem(Garage.CACHEKEY, JSON.stringify(Garage.cache));
	};
	
	// Triggers events namespaced with 'garage:'. Not fully implemented
	// for cross browser functionality.
	Garage.trigger = function(evtName, args) {
		var evt = document.createEvent('Event');
		evt.initEvent('garage:'+evtName, true, true);
		evt.args = args;
		root.dispatchEvent(evt);
	};
	
	// Returns the time that the cache should expire
	Garage._expirationTimeInMS = function() {
		return (Date.now() - 1000 * 60 * 60 * 24 * Garage.CACHEEXPIRATIONDAYS);
	};

	// Setup localStorage to track added items and timestamps	
	Garage._setupCache = function() {
		if (Garage.get(Garage.CACHEKEY) === null) {
			// Dont use Garage.add here to avoid the garage:add event
			localStorage.setItem(Garage.CACHEKEY, JSON.stringify({}));
		}
		this._updateCache();
	};
	
	// Get the tracked items from localStorage and store in memory
	Garage._updateCache = function() {
		Garage.cache = Garage.getJSON(Garage.CACHEKEY);
	};
	
	// Event listeners
	root.addEventListener('garage:add', function(e) {
		Garage.addToCache.apply(Garage, e.args);
	});
	
	root.addEventListener('garage:remove', function(e) {
		Garage.removeFromCache.apply(Garage, e.args);
	});
	
	// Setup cache on load
	Garage._setupCache();

}).call(this);