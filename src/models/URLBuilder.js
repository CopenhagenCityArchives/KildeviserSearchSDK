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