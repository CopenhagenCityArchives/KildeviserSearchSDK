
var KildeViserSearchSDK = (function(){

	var KildeviserSearch = function(collectionId){

		var KildeviserSearch = {};
		KildeviserSearch.collectionId = collectionId;
		KildeviserSearch.controller = function(){
			KildeviserSearch.vm.init(KildeviserSearch.collectionId);
		};

		KildeviserSearch.view = function(ctrl) {
			var children = [
				KildeviserSearch.ViewFilter(),
				m("button",{class:"btn btn-primary regularsubmit", onclick: function(){KildeviserSearch.vm.search(); } },'Find'),
				m("p", {role: 'status', class: KildeviserSearch.vm.statusClass()}, KildeviserSearch.vm.status())
			]
			return m("div", {class:"kildeviser"}, children);
		};

		KildeviserSearch.vm = (function(){
				var vm = {};

				vm.status = m.prop("");
				vm.statusClass = m.prop("d-none");
				vm.setStatus = function(message) {
					vm.status(message);
					if (!message) {
						vm.statusClass("d-none");
					} else {
						vm.statusClass("");
					}
				};

		    	vm.init = function(collectionId) {
					this.collection = new Collection(collectionId);
			        vm.collection = this.collection;

			        this.collection.get();
		    	};
 
		    	vm.search = function(){
					vm.setStatus("");
		    		this.collection.search().then(function(data){
		    			if(data.length > 0){
							var urlBuilder = new URLBuilder();
							
							var kildeviserHostname = ProfileConfiguration().hostname;
 
							if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1){
								//It's Safari, redirect!
								window.location.assign(kildeviserHostname + '/kildeviser/#?collection=' + this.collection.id() + '&item=' + data[0].id);
							}
							var url = kildeviserHostname + '/kildeviser/#?collection=' + this.collection.id() + '&item=' + data[0].id;

							var newWin = window.open(url);
		    			}
		    			else{
		    				vm.setStatus("Ingen resultater fundet");
		    			}
		    		}.bind(this));
		    	};

		    	vm.focus = m.prop(undefined);

		    	return vm;
		})();

		KildeviserSearch.ViewFilter = function(){
			// find jQuery object with select2
			var jQueryObject = $;
			if (!$ || !$.fn.select2 && jQuery) {
				jQueryObject = jQuery;
			}
			return KildeviserSearch.vm.collection.filters.map(function(filter, index) {
				var labelId = 'collection-' + KildeviserSearch.vm.collection.id() + '-filter-' + filter.name() + '-label';

				return [
					m("div", {class:"span12"}, [
						m("select", {
							config: function(elem) {
								jQueryObject(elem)
									.select2({
										minimumResultsForSearch: 5,
										theme: 'bootstrap4',
										allowClear: true,
										placeholder: filter.placeHolder(),
										disabled: filter.values.length > 0 ? false : true,
										'language': {
											noResults: function(){ return 'Ingen resultater'; }
										}
									});
							},
							onchange: function(e) {
								filter.selectedValue(e.target.value);
								KildeviserSearch.vm.collection.updateFilters(filter.name(), filter.selectedValue());
							},
							style: "width: 100%;",
							'aria-labelledby': labelId
						}, [
							m("option", {}, ""),
							filter.values.map(function(curVal, i) {
								return m("option", {value: curVal}, curVal);
							})
						]),
						m('p', {
							id: labelId
						}, [
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
		m.module(document.getElementById(elementId), {controller: kildeviser.controller, view: kildeviser.view});
	};

	return pubs;

})();
