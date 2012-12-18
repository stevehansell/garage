describe('Garage', function() {

	beforeEach(function() {
		spyOn(Garage, 'trigger');
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
		
		it('triggers an garage:add event', function() {
			Garage.add('foo', 'bar');
			expect(Garage.trigger).toHaveBeenCalledWith('add', jasmine.any(Array));
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
	
	it('removes all items from localStorage', function() {
		spyOn(localStorage, 'clear');
		Garage.empty();
		expect(localStorage.clear).toHaveBeenCalled();
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
		expect(Garage.CACHEEXPIRATIONTIME).toBe(7);
		
		Garage.setCacheExpirationTime(4);
		expect(Garage.CACHEEXPIRATIONTIME).toBe(4);
	});
	
});