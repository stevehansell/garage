describe('Garage', function() {

	beforeEach(function() {
		spyOn(Garage, 'trigger');
		Garage.cache = {};
	});
	
	afterEach(function() {
		Garage.blacklistedItems = null;
		localStorage.clear();
	});
	
	describe('on load', function() {
		it('sets a localStorage item to cache items and timestamps', function() {
			expect(localStorage.getItem('GARAGEITEMS')).not.toBe(null);
		});
	
		it('stores the cache in memory on load', function() {
			localStorage.setItem('GARAGEITEMS', JSON.stringify({foo: 'bar'}));
			spyOn(Garage, 'getJSON').andCallThrough();
			expect(Garage.cache).toBeDefined();
		});
	});
	
	describe('add', function() {
		it('adds items to localStorage', function() {
			Garage.add('foo', 'bar');
			expect(localStorage.getItem('foo')).toBe('bar');
		});

		it('adds stringified JSON objects to localStorage', function() {
			spyOn(JSON, 'stringify');
			Garage.add('foo', {'bar': 'baz'});
			expect(JSON.stringify).toHaveBeenCalled();
		});
		
		it('triggers a garage:add event', function() {
			Garage.add('foo', 'bar');
			expect(Garage.trigger).toHaveBeenCalledWith('add', jasmine.any(Array));
		});
		
		xit('handles quota_exceeded exceptions', function() {
			// Force localStorage.setItem to throw an error to mock out of memory
			spyOn(localStorage, 'setItem').andCallFake(function() {
				throw new Error("QUOTA_EXCEEDED_ERR", "QUOTA_EXCEEDED_ERR: DOM Exception 22");
			});
			spyOn(Garage, 'clean');
			// spyOn(Garage, 'add');
			
			expect(function() {
				Garage.add('foo', 'EXCEED QUOTA');
			}).not.toThrow();
			
			expect(Garage.clean).toHaveBeenCalled();
			expect(Garage.add.callCount).toBe(2);
		});
	});

	it('gets an item from localStorage', function() {
		localStorage.setItem('foo', 'bar');
		spyOn(localStorage, 'getItem').andCallThrough();
		var foo = Garage.get('foo');
		expect(localStorage.getItem).toHaveBeenCalledWith('foo');
		expect(foo).toBe('bar');
	});
	
	it('gets an item as JSON from localStorage', function() {
		localStorage.setItem('foo', JSON.stringify({'foo': 'bar'}));
		spyOn(JSON, 'parse').andCallThrough();
		var foo = Garage.getJSON('foo');
		expect(JSON.parse).toHaveBeenCalled();
	});
	
	it('removes an item from localStorage', function() {
		spyOn(localStorage, 'removeItem');
		Garage.remove('foo');
		expect(localStorage.removeItem).toHaveBeenCalledWith('foo');
	});
	
	it('removes all items from localStorage and cleans the cache', function() {
		spyOn(localStorage, 'clear');
		spyOn(Garage, '_setupCache');
		Garage.empty();
		expect(localStorage.clear).toHaveBeenCalled();
		expect(Garage._setupCache).toHaveBeenCalled();
	});
	
	describe('clean', function() {
		it('removes all items if there is not a blacklist supplied', function() {
			spyOn(localStorage, 'clear');
			Garage.clean();
			expect(localStorage.clear).toHaveBeenCalled();
		});
		
		it('removes blacklisted items from localStorage', function() {
			localStorage.setItem('foo', 'bar');
			localStorage.setItem('baz', 'bar');
			localStorage.setItem('din', 'far');
			
			spyOn(localStorage, 'removeItem');
			// Fake the blacklistedItems implementation
			Garage.blacklistedItems = ['foo', 'baz'];
			
			Garage.clean();
			
			expect(localStorage.removeItem.callCount).toBe(2);
		});
	});
	
	describe('setBlacklist', function() {
		it('creates a blacklistedItems array from an array of keys', function() {
			Garage.setBlacklist(['foo', 'bar']);
			expect(Garage.blacklistedItems[0]).toBe('foo');
			expect(Garage.blacklistedItems[1]).toBe('bar');
			expect(Garage.blacklistedItems.length).toBe(2);
		});
	});
	
	describe('addToBlacklist', function() {
		it('adds a blacklisted item (string) to the blacklistedItems array', function() {
			Garage.blacklistedItems = []; // Setup test, assuming items already exist in array
			
			Garage.addToBlacklist('baz');
			expect(Garage.blacklistedItems[0]).toBe('baz');
			expect(Garage.blacklistedItems.length).toBe(1);
		});
		
		it('delegates to setBlacklist if the blacklistedItems array does not exist', function() {
			Garage.addToBlacklist('baz');
			expect(Garage.blacklistedItems[0]).toBe('baz');
			expect(Garage.blacklistedItems.length).toBe(1);
		});
	});
	
	describe('addToCache', function() {
		it('adds a newly added storage item to the cache with a timestamp', function() {
			spyOn(Date, 'now').andReturn(1355798955678);
			spyOn(localStorage, 'setItem');
			
			Garage.addToCache('foo');
			
			expect(Garage.cache.foo).toBe(1355798955678)
			expect(localStorage.setItem).toHaveBeenCalledWith('GARAGEITEMS', jasmine.any(String));
		});
	});
	
	describe('removeFromCache', function() {
		it('removes an item from the cache', function() {
			Garage.addToCache('bar');
			
			Garage.removeFromCache('bar');
			
			expect(Garage.cache.bar).not.toBeDefined();
		});
	});
	
	it('sets cache expiration', function() {
		expect(Garage.CACHEEXPIRATIONDAYS).toBe(7);
		
		Garage.setCACHEEXPIRATIONDAYS(4);
		expect(Garage.CACHEEXPIRATIONDAYS).toBe(4);
		
		Garage.setCACHEEXPIRATIONDAYS(7); // Cleanup
	});
	
	describe('expire', function() {
		it('removes keys that are older than the cache expiration time', function() {
			// Setup
			localStorage.clear();
			var validTime = 1355801635253;
			var expiredTime = 1355110435253;
			var deadline = + new Date(validTime - (1000 * 60 * 60 * 24 * Garage.CACHEEXPIRATIONDAYS))
			localStorage.setItem('foo', 'bar');
			localStorage.setItem('bar', 'baz');
			Garage.cache = {'foo': validTime, 'bar': expiredTime};
			localStorage.setItem(Garage.CACHEKEY, JSON.stringify({'foo': validTime, 'bar': expiredTime}));
			spyOn(Garage, 'remove').andCallThrough();
			spyOn(Garage, '_expirationTimeInMS').andReturn(deadline);
			
			Garage.expire();
			
			expect(Garage.remove).toHaveBeenCalledWith('bar');
			expect(Garage.get(Garage.CACHEKEY).bar).not.toBeDefined();
		});
		
		it('updates the cache before expiring', function() {
			spyOn(Garage, '_updateCache');
			Garage.expire();
			expect(Garage._updateCache).toHaveBeenCalled();
		});
	});
	
});