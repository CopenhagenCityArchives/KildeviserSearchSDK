	/*
		Filter - Represents a single filter
	*/
	var Filter = function(collectionId, data){
		if(data.required_levels !== undefined && data.required_levels !== false){
			this.requiredLevels = data.required_levels;
		}
		else{
			this.requiredLevels = [];
		}
		this.name = m.prop(data.name);
		this.gui_name = m.prop(data.gui_name);
		this.helpText = m.prop(data.gui_description);
		this.placeHolder = m.prop(data.gui_name);
		this.valuesUrl = 'https://www.kbhkilder.dk/api/metadata/' + collectionId + '/' + data.name;

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

		return true;
	};

	//Updates the values based on the given filter values
	Filter.prototype.updateValues = function(filterValues){
		if(this._requiredFiltersSet(filterValues)){

			m.request({method: "GET", url: this._buildUrl(filterValues), dataType: "jsonp"})
			.then(function(data){
				this.values = [];
				for(var i = 0; i < data.length; i++){
					this.values.push(data[i].text);
				}
				this.valuesStr(this._valuesToString(this.values));

				//Resets the selected value, if it is not given in the values array
				if(this.values.indexOf(this.selectedValue()) == -1){
					this.selectedValue("");
				}
				if(this.values.length == 1){
					this.selectedValue(this.values[0]);
				}

			}.bind(this));
		}
		else{
			this.values.length = 0;
			this.valuesStr(this._valuesToString(this.values));
			this.selectedValue("");
		}
	};

	Filter.prototype._buildUrl = function(filterValues){
		var builder = new URLBuilder();
		var url = builder.buildUrl(this.valuesUrl, filterValues);
		return url;
	};

	Filter.prototype._valuesToString = function(values){
		return JSON.stringify(values);
	};
