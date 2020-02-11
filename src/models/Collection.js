	/*
		Collection - Represents a collection
	*/
	var Collection = function(id){
		this.name = m.prop('test name');
		this.id = m.prop(id);
		this.description = m.prop('');
		this.resourceUrl = "https://www.kbhkilder.dk/api/collections/";
		this.searchUrl = "https://www.kbhkilder.dk/api/data/" + id;
		this.filters = m.prop([]);
		this.values = m.prop([]);
	};

	//Retrieves collection info and filters
	Collection.prototype.get = function(){
		var url = this.resourceUrl + this.id();

		m.request({method: "GET", url: url, dataType: "jsonp"})
			.then(function(data){
				this._loadData(data[0]);
				this.filters[0].updateValues([]);
			}.bind(this));
	};

	//Puts data in filter array
	Collection.prototype._loadData = function(data){
		var arr = [];
		for(var i = 0; i < data.levels.length; i++){
			if(data.levels[i].searchable == true)
				arr.push(new Filter(this.id(), data.levels[i]));
		}

		arr.sort(function(a, b){return a.order-b.order;});

		this.filters = arr;
	};

	//Updates all from the one changed
	Collection.prototype.updateFilters = function(filterName, filterValue){
		if(filterName == undefined)
			return;

		var index = -1;
		for(var i = 0; i < this.filters.length; i++){
			if(this.filters[i].name() == filterName)
				index = i;
		}

		if(index == -1)
			return;

		this.filters[index].selectedValue(filterValue);

		//Don't update if the filter value is not a possible value
		if(this.filters[index].selectedValue() !== "" && this.filters[index].values.indexOf(filterValue) == -1)
			return;

		//Getting selected values from all filters
		var filterValues = 	this._getFilterValues();

		//Updating the values of the filter itself, if it has no values
		if(this.filters[index].values.length == 0){
			this.filters[index].updateValues(filterValues);
		}

		//Updating the values of the filters beneath the given filter index
		for(var i = index+1; i < this.filters.length; i++){
			this.filters[i].updateValues(filterValues);
		}
	};

	//Retrieves a list of name:value pairs from all filters where a value is given
	Collection.prototype._getFilterValues = function(){
		var values = [];
		for(var i = 0; i < this.filters.length; i++){
			var filter = this.filters[i];
			if(filter.selectedValue() !== undefined)
				values.push({name : filter.name(), value: filter.selectedValue()});
		}

		return values;
	};

	//Performs a search based on the given filters
	Collection.prototype.search = function(){
		var builder = new URLBuilder();

		return m.request({method: "GET", url: builder.buildUrl(this.searchUrl, this._getFilterValues()), dataType: "jsonp"});
	};
