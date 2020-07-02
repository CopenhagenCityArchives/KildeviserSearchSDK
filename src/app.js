
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

		    	return vm;
		})();

		KildeviserSearch.ViewFilter = function(){
			// find jQuery object with select2
			var $ = $;
			if (!$ || !$.fn.select2 && jQuery) {
				$ = jQuery;
			}

			// assign to each filter, which filters requires it
			KildeviserSearch.vm.collection.filters.map(function(filter) {
				filter.requriedByFilters = [];
			});
			KildeviserSearch.vm.collection.filters.forEach(function(filter) {
				var requiredFilters = KildeviserSearch.vm.collection.filters.filter(function(reqFilter) {
					return filter.requiredLevels.indexOf(reqFilter.name()) != -1 
				});

				requiredFilters.forEach(function(reqFilter) {
					reqFilter.requiredByFilters.push(filter)
				});
			});

			return KildeviserSearch.vm.collection.filters.map(function(filter, index) {
				var baseId = 'collection-' + KildeviserSearch.vm.collection.id() + '-filter-' + filter.name();
				return [
					m("div", {class:"span12"}, [
						m("div", { id: 'select2-dropdown-' + baseId }),
						m("select", {
							config: function(elem, isInitialized, context) {
								if (!isInitialized) {
									$(elem).attr('id', baseId + '-select');

									// setup event handler only on initialization
									$(elem).on('select2:select', function(e) {
										// we only want to restore focus to filters that will cause a redraw
										// ie. filters that are not required by any other filters
										if (filter.requiredByFilters !== undefined && filter.requiredByFilters.length > 0) {
											filter.restoreFocus = true;
										}
										filter.selectedValue(e.target.value);
										KildeviserSearch.vm.collection.updateFilters(filter.name(), filter.selectedValue());

										// clear dependant filters on select
										filter.requiredByFilters.forEach(function(requiredByFilter) {
											requiredByFilter.disabled(true);
											$('#collection-' + KildeviserSearch.vm.collection.id() + '-filter-' + requiredByFilter.name() + '-select').val("");
										});
									});

									// setup WAI-ARIA attributes when opening dropdown
									$(elem).on('select2:open', function() {
										var $searchbox = $('#select2-dropdown-' + baseId).find('[role="searchbox"]');
										$searchbox.attr('aria-label', 'Filtrér værdier for ' + filter.placeHolder());
										var $listbox = $('#select2-dropdown-' + baseId).find('[role="listbox"]');
										$listbox.attr('aria-label', 'Værdier for ' + filter.placeHolder());
									});

									// clear dependant filters on clear
									$(elem).on('select2:clear', function() {
										filter.requiredByFilters.forEach(function(requiredByFilter) {
											requiredByFilter.disabled(true);
											$('#collection-' + KildeviserSearch.vm.collection.id() + '-filter-' + requiredByFilter.name() + '-select').val("");
										});

										m.redraw();
									});
								} else if (filter.restoreFocus) {
									// restore focus to a filter that was selected, and caused the redraw
									filter.restoreFocus = undefined;
									setTimeout(function() {
										$(elem).focus();
									})
								}

								// we reset select2 on each redraw
								$(elem).select2({
									minimumResultsForSearch: 5,
									theme: ProfileConfiguration().select2Theme,
									closeOnSelect: true,
									allowClear: true,
									dropdownParent: $('#select2-dropdown-' + baseId),
									placeholder: filter.placeHolder(),
									disabled: filter.disabled(),
									'language': {
										noResults: function(){ return 'Ingen resultater'; }
									}
								});

								// WAI-ARIA conformity
								var $textbox = $(elem).next().find('.select2-selection__rendered');
								if ($textbox.find('.select2-selection__placeholder').length > 0) {
									$textbox.attr('aria-label', 'Ingen valgt værdi for ' + filter.placeHolder())
								} else {
									$textbox.attr('aria-label', 'Valgte værdi for ' + filter.placeHolder())
								}

							},
							style: "width: 100%;",
							'aria-label': 'Vælg ' + filter.placeHolder()
						}, [
							m("option", {}, ""),
							filter.values().map(function(curVal, i) {
								return m("option", {value: curVal}, curVal);
							})
						]),
						m('p', {
							id: baseId + '-label'
						}, [
							m('em', filter.helpText())
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
