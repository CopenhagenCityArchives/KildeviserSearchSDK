	/*
		Collection - Represents a collection
	*/
	var Collection = function(id){
		this.name = m.prop('test name');
		this.id = m.prop(id);
		this.description = m.prop('');
		this.resourceUrl = "http://www.kbhkilder.dk/api/collections/";
		this.searchUrl = "http://www.kbhkilder.dk/api/data/" + id;
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
			/*.then(function(data){
				this.updateFilters();
			}.bind(this));*/
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
console.log("updateFilters called", filterName);

//console.log(this);
		if(filterName == undefined)
			return;

		var index = -1;
		for(var i = 0; i < this.filters.length; i++){
			if(this.filters[i].name() == filterName)
				index = i;
		}

		if(index == -1)
			return;
	//	console.log("selectedValue:", selectedValue);
		this.filters[index].selectedValue(filterValue);
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

	/*
		Filter - Represents a single filter
	*/
	var Filter = function(collectionId, data){
		if(data.required_levels !== false){
			this.requiredLevels = data.required_levels;
		}
		else{
			this.requiredLevels = [];
		}
		this.name = m.prop(data.name);
		this.gui_name = m.prop(data.gui_name);
		this.helpText = m.prop(data.gui_description);
		this.placeHolder = m.prop(data.gui_name);
		this.valuesUrl = 'http://www.kbhkilder.dk/api/metadata/' + collectionId + '/' + data.name;
		
		this.selectedValue = m.prop("");
		this.values = [];
		this.valuesStr = m.prop('');
		this.order = data.order;
	};

	//Returns wheter the given array holds all required filter values or not
	Filter.prototype._requiredFiltersSet = function(filterValues){
		if(this.requiredLevels.length == 0)
			return true;

		//Are all required filters set? For each required filter, check if the corresponding filterValue is defined
		var matches = 0;
		for(var i = 0; i < filterValues.length; i++){
			if(this.requiredLevels.indexOf(filterValues[i].name) !== -1 && (filterValues[i].value !== "" && filterValues[i].value !== undefined)){
				matches++;
			}
		}

		if(matches !== this.requiredLevels.length)
			return false;


console.log('All required filters set for ' + this.name());

		return true;
	};

	//Updates the values based on the given filter values
	Filter.prototype.updateValues = function(filterValues){
		var builder = new URLBuilder();
		var url = builder.buildUrl(this.valuesUrl, filterValues);
console.log('updating filters for ', this.name());
		if(this._requiredFiltersSet(filterValues)){
			//m.startComputation();
			m.request({method: "GET", url: url, dataType: "jsonp"})
			.then(function(data){
				this.values = [];
				for(var i = 0; i < data.length; i++){
					this.values.push(data[i].text);
				}
				this.valuesStr(this._valuesToString(this.values));
			//	m.endComputation();
			}.bind(this));
		}
		else{
			this.values.length = 0;
			this.valuesStr(this._valuesToString(this.values));
		}		
	};

	Filter.prototype._valuesToString = function(values){
		var str = '[';
		var strAdded = false;
		for(var i = 0; i < values.length; i++){
			str = str + '"' + values[i] + '",';
			strAdded = true;
		}
		
		if(strAdded)
			str = str.substring(0,str.length-1);
		
		str = str + ']';

		return str;
	};
	/*
		FilterValue - A simple class holdning a name and a value
	*/
	var FilterValue = function(name, value){
		this.name = name;
		this.value = value;
	};

	//Compare the filter value with another filter value
	FilterValue.prototype.compare = function(filterValue){
		return (this.name == filterValue.name && this.value == filterValue.value);
	};
	/*
		URLBuilder - Builds URLs from base url and name value pairs
	*/
	var URLBuilder = function(){};

	URLBuilder.prototype.buildUrl = function(baseUrl, filterValues){
		var url = "";
		
		if(baseUrl.substring(baseUrl.length-1, baseUrl.length) == '&'){
			url = baseUrl;
		}
		else{
			url = baseUrl + '?';	
		}
		
		for(var i = 0; i < filterValues.length; i++){
			var filterValue = filterValues[i];
			if(filterValue.value !== undefined && filterValue.value.length > 0){
				url = url + filterValue.name + '=' + filterValue.value + '&';
			}
		}
		return url.substring(0,url.length-1);
	};

var KildeViserSearchSDK = (function(){

	var KildeViserSearch = {};
	KildeViserSearch.collectionId = -1;

	KildeViserSearch.vm = (function(){
	    var vm = {};
	    vm.status = m.prop("");
    	vm.init = function(collectionId) {
			KildeViserSearch.collection = new Collection(collectionId);
	        vm.collection = KildeViserSearch.collection;

	        KildeViserSearch.collection.get();
    	};

    	vm.search = function(){
			vm.status("");
    		KildeViserSearch.collection.search().then(function(data){
    			if(data.length > 0){
    				var urlBuilder = new URLBuilder();
    				location.href= urlBuilder.buildUrl('http://www.kbharkiv.dk/kildeviser/#!?collection=' + KildeViserSearch.collection.id() + '&search=1&', KildeViserSearch.collection._getFilterValues());
    				location.href = 'http://www.kbharkiv.dk/kildeviser/#?collection=' + KildeViserSearch.collection.id() + '&item=' + data[0].id;
    			}
    			else{
    				vm.status("Ingen resultater fundet");
    			}
    		});
    	}

    	return vm;
	})();

	KildeViserSearch.controller = function(){
		KildeViserSearch.vm.init(KildeViserSearch.collectionId);
	};

	KildeViserSearch.view = function(){
		return m("html", [
			        m("div", [
			        	m("p", {class: 'text-center'}, KildeViserSearch.vm.collection.name()),
			        	m("div", {config:KildeViserSearch.draw }, [
			        		KildeViserSearch.vm.collection.filters.map(function(filter, index) {
								return m("div", [
									m("input",{
										type:"text", 
										"class":"span3 typeaheadinput", 
										//style:"margin: 0 auto;", 
										"data-provide":"typeahead",
										"autocomplete": "off", 
										"data-items":"6", 
										"data-minLength": "0",
										"data-source":filter.valuesStr(), 
										curFilter: filter.name(),
										value: filter.selectedValue(),
										placeholder: filter.placeHolder(),
										helpText: filter.helpText(),
										onchange: function(e){
											KildeViserSearch.vm.collection.filters[index].selectedValue(e.target.value);
											
											console.log('selected value 1',filter.selectedValue(),filter);
											//console.log(this);
											//filter.selectedValue();
											KildeViserSearch.vm.collection.updateFilters(filter.name(), filter.selectedValue());
											console.log('selected value 2',filter.selectedValue());
										}
									}),
									m("div", {"class": (filter.placeHolder() == filter.helpText()) ? "questionmark active" : "questionmark", onclick: function(){ if(filter.placeHolder() == filter.helpText()){ filter.placeHolder(filter.gui_name()); }else{ filter.placeHolder(filter.helpText()); }}}, "?"),
									m("div", {"class": "clearfield", onclick: function(){ /*filter.selectedValue("");*/ KildeViserSearch.vm.collection.updateFilters(filter.name(), filter.selectedValue()); }}, "X")
								]);
			                })
		        		]),
						m("button",{onclick: function(){KildeViserSearch.vm.search(); } },'Søg'),
						m("p", KildeViserSearch.vm.status())
	        		])
	        	]);
	};

	KildeViserSearch.draw = function(element, isInitialized, context) {
		console.log("Running draw");
		console.log("isInitialized:", isInitialized);

	    //don't redraw if we did once already
	    if (isInitialized) return;
	}

	
	var pubs = {};

	pubs.init = function(collectionId, elementId){
		KildeViserSearch.collectionId = collectionId;
		m.module(document.getElementById(elementId), {controller: KildeViserSearch.controller, view: KildeViserSearch.view});
	}

	return pubs;

})();

	//initialize the application
	$(document).ready(function(){
		KildeViserSearchSDK.init(2, 'example');
	});
	
