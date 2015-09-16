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