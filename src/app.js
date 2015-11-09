
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
							m("input",{
								type:"text",
								id: "filter-" + filter.name(),
								"class":"span12 typeahead",
								"data-provide":"typeahead",
								"autocomplete": "off", 
								"data-items":"6", 
								"data-minLength": "0",
								//"data-source":filter.valuesStr(), 
								curFilter: filter.name(),
								value: filter.selectedValue(),
								placeholder: filter.placeHolder(),
								helpText: filter.helpText(),
								disabled: filter.values.length === 0 ? true : false,
								onchange: function(e){
									//KildeViserSearch.vm.collection.filters[index].selectedValue(e.target.value);
									filter.selectedValue(e.target.value);
								//	KildeViserSearch.vm.focus(e.target);
									KildeviserSearch.vm.collection.updateFilters(filter.name(), filter.selectedValue());
								},
								config: function(element){
									var typeahead = jQuery(element).typeahead();
									//Updating the source
									typeahead.data('typeahead').source = filter.values;

									//Selecting elements on the list when an arrow key is pressed
									$(element).on('keydown', function(e){
											//arrow up and down
                                            if(e.keyCode == 40 || e.keyCode == 38){
	                                            $parentDiv = $(element);
	                                            $innerListItem = $(element).parent().find('li.active').first();
	                                            $('.typeahead.dropdown-menu').scrollTop($innerListItem.prevAll().length*$innerListItem.height());
                                            }
                                    });
								}
							}),
							m("div", {"class": "clearfield", onclick: function(){ /*ilter.selectedValue("");*/ KildeviserSearch.vm.collection.updateFilters(filter.name(), ""); }}, "X"),
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

		//KildeViserSearch.collectionId = collectionId;
		m.module(document.getElementById(elementId), {controller: kildeviser.controller, view: kildeviser.view});
	};

	return pubs;

})();