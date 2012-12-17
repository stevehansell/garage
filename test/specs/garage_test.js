describe('Garage', function() {

	afterEach(function() {
		Garage.blacklistedItems = null;
	});
	
	it('sets a localStorage item to track stored items and timestamps', function() {
		expect(localStorage.getItem('GARAGEITEMS')).not.toBe(null);
	});
	
	describe('add', function() {
		beforeEach(function() {
			spyOn(Garage, 'trigger');
		});
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
	
});