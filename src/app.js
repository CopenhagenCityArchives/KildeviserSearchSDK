
var KildeViserSearchSDK = (function(){

	var KildeviserSearch = function(collectionId){

		var KildeviserSearch = {};
		KildeviserSearch.collectionId = collectionId;
		KildeviserSearch.controller = function(){
			KildeviserSearch.vm.init(KildeviserSearch.collectionId);
		};

		KildeviserSearch.view = function(ctrl){
				return m("div", {class:"kildeviser"}, [
					KildeviserSearch.ViewFilter(),
					m("button",{class:"regularsubmit", onclick: function(){KildeviserSearch.vm.search(); } },'Find'),
					m("p", KildeviserSearch.vm.status())
				]);
		};	

		KildeviserSearch.vm = (function(){
			    var vm = {};
			    vm.status = m.prop("");
		    	vm.init = function(collectionId) {
					this.collection = new Collection(collectionId);
			        vm.collection = this.collection;

			        this.collection.get();
		    	};

		    	vm.search = function(){
					vm.status("");
		    		this.collection.search().then(function(data){
		    			if(data.length > 0){
		    				var urlBuilder = new URLBuilder();
		    				//location.href= urlBuilder.buildUrl('http://www.kbharkiv.dk/kildeviser/#!?collection=' + KildeViserSearch.collection.id() + '&search=1&', KildeViserSearch.collection._getFilterValues());
		    				//location.href = 'http://www.kbharkiv.dk/kildeviser/#?collection=' + KildeViserSearch.collection.id() + '&item=' + data[0].id;
		    					if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1){
		    						//It's Safari, redirect!
		    						window.location.assign('http://www.kbharkiv.dk/kildeviser/#?collection=' + this.collection.id() + '&item=' + data[0].id);	
		    					}
		    					var url = 'http://www.kbharkiv.dk/kildeviser/#?collection=' + this.collection.id() + '&item=' + data[0].id;

								var newWin = window.open(url);             
/*
								if(!newWin || newWin.closed || typeof newWin.closed=='undefined') 
								{ 
									window.location.assign('http://www.kbharkiv.dk/kildeviser/#?collection=' + this.collection.id() + '&item=' + data[0].id);
								}
*/

		    			}
		    			else{
		    				vm.status("Ingen resultater fundet");
		    			}
		    		}.bind(this));
		    	};

		    	vm.focus = m.prop(undefined);

		    	return vm;
		})();

		KildeviserSearch.ViewFilter = function(){
			return KildeviserSearch.vm.collection.filters.map(function(filter, index) {
				return [
					m("div", {class:"span12"}, [
						m("select", { 
							config: function(elem){ jQuery(elem).select2({minimumResultsForSearch: 5, theme: 'classic', allowClear: true, placeholder: filter.placeHolder(), disabled: filter.values.length > 0 ? false : true, 'language': { noResults: function(){ return 'Ingen resultater';}}});},
							onchange: function(e){
								filter.selectedValue(e.target.value);
								KildeviserSearch.vm.collection.updateFilters(filter.name(), filter.selectedValue());
							},
							style: "width:80%; max-width:600px;",
							},
							[ m("option", {}, ""),
							filter.values.map(function(curVal, i){
								return m("option", {value: curVal}, curVal);	
							})
						]),
						m('p', [
							m('i', filter.helpText())
						]),
					]),
					m('.clearfix')
				];
			});
		};

		return KildeviserSearch;
	};
	
	var pubs = {};

	pubs.init = function(collectionId, elementId){
		var kildeviser = new KildeviserSearch(collectionId);

		//Load CSS dependency
		var cssLink = 'http://www.kbhkilder.dk/software/KildeviserSearchSDK/select2.css';
		var cssId = encodeURIComponent(cssLink);
		if (!document.getElementById(cssId))
		{
		    var head  = document.getElementsByTagName('head')[0];
		    var link  = document.createElement('link');
		    link.id   = cssId;
		    link.rel  = 'stylesheet';
		    link.type = 'text/css';
		    link.href = cssLink;
		    link.media = 'all';
		    head.appendChild(link);
		}

		//KildeViserSearch.collectionId = collectionId;
		m.module(document.getElementById(elementId), {controller: kildeviser.controller, view: kildeviser.view});
	};

	return pubs;

})();