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
/* =============================================================
 * bootstrap-typeahead.js v2.3.2
 * http://twbs.github.com/bootstrap/javascript.html#typeahead
 * =============================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function($){

  "use strict"; // jshint ;_;


 /* TYPEAHEAD PUBLIC CLASS DEFINITION
  * ================================= */

  var Typeahead = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.typeahead.defaults, options)
    this.matcher = this.options.matcher || this.matcher
    this.sorter = this.options.sorter || this.sorter
    this.highlighter = this.options.highlighter || this.highlighter
    this.updater = this.options.updater || this.updater
    this.source = this.options.source
    this.$menu = $(this.options.menu)
    this.shown = false
    this.listen()
  }

  Typeahead.prototype = {

    constructor: Typeahead

  , select: function () {
      var val = this.$menu.find('.active').attr('data-value')
      this.$element
        .val(this.updater(val))
        .change()
      return this.hide()
    }

  , updater: function (item) {
      return item
    }

  , show: function () {
      var pos = $.extend({}, this.$element.position(), {
        height: this.$element[0].offsetHeight
      })

      this.$menu
        .insertAfter(this.$element)
        .css({
          top: pos.top + pos.height
        , left: pos.left
        })
        .show()

      this.shown = true
      return this
    }

  , hide: function () {
      this.$menu.hide()
      this.shown = false
      return this
    }

  , lookup: function (event) {
      var items

      this.query = this.$element.val()

      if (this.query.length < this.options.minLength) {
        return this.shown ? this.hide() : this
      }

      items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source

      return items ? this.process(items) : this
    }

  , process: function (items) {
      var that = this

      items = $.grep(items, function (item) {
        return that.matcher(item)
      })

      items = this.sorter(items)

      if (!items.length) {
        return this.shown ? this.hide() : this
      }

      return this.render(items.slice(0, this.options.items)).show()
    }

  , matcher: function (item) {
      return ~item.toLowerCase().indexOf(this.query.toLowerCase())
    }

  , sorter: function (items) {
      var beginswith = []
        , caseSensitive = []
        , caseInsensitive = []
        , item

      while (item = items.shift()) {
        if (!item.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
        else if (~item.indexOf(this.query)) caseSensitive.push(item)
        else caseInsensitive.push(item)
      }

      return beginswith.concat(caseSensitive, caseInsensitive)
    }

  , highlighter: function (item) {
      var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
      return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>'
      })
    }

  , render: function (items) {
      var that = this

      items = $(items).map(function (i, item) {
        i = $(that.options.item).attr('data-value', item)
        i.find('a').html(that.highlighter(item))
        return i[0]
      })

      items.first().addClass('active')
      this.$menu.html(items)
      return this
    }

  , next: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , next = active.next()

      if (!next.length) {
        next = $(this.$menu.find('li')[0])
      }

      next.addClass('active')
    }

  , prev: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , prev = active.prev()

      if (!prev.length) {
        prev = this.$menu.find('li').last()
      }

      prev.addClass('active')
    }

  , listen: function () {
      this.$element
        .on('focus',    $.proxy(this.focus, this))
        .on('blur',     $.proxy(this.blur, this))
        .on('keypress', $.proxy(this.keypress, this))
        .on('keyup',    $.proxy(this.keyup, this))

      if (this.eventSupported('keydown')) {
        this.$element.on('keydown', $.proxy(this.keydown, this))
      }

      this.$menu
        .on('click', $.proxy(this.click, this))
        .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
        .on('mouseleave', 'li', $.proxy(this.mouseleave, this))
    }

  , eventSupported: function(eventName) {
      var isSupported = eventName in this.$element
      if (!isSupported) {
        this.$element.setAttribute(eventName, 'return;')
        isSupported = typeof this.$element[eventName] === 'function'
      }
      return isSupported
    }

  , move: function (e) {
      if (!this.shown) return

      switch(e.keyCode) {
        case 9: // tab
        case 13: // enter
        case 27: // escape
          e.preventDefault()
          break

        case 38: // up arrow
          e.preventDefault()
          this.prev()
          break

        case 40: // down arrow
          e.preventDefault()
          this.next()
          break
      }

      e.stopPropagation()
    }

  , keydown: function (e) {
      this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [40,38,9,13,27])
      this.move(e)
    }

  , keypress: function (e) {
      if (this.suppressKeyPressRepeat) return
      this.move(e)
    }

  , keyup: function (e) {
      switch(e.keyCode) {
        case 40: // down arrow
        case 38: // up arrow
        case 16: // shift
        case 17: // ctrl
        case 18: // alt
        case 9:
          break

       // case 9: // tab
        case 13: // enter
          if (!this.shown) return
          this.select()
          break

        case 27: // escape
          if (!this.shown) return
          this.hide()
          break

        default:
          this.lookup()
      }

      e.stopPropagation()
      e.preventDefault()
  }

  , focus: function (e) {
      if(this.$element.val() == 0){
        this.focused = true
        this.lookup()
      }
    }

  , blur: function (e) {
      if ((!this.mousedover && this.shown)) {
        this.hide()
      }
    }

  , click: function (e) {
      e.stopPropagation()
      e.preventDefault()
      this.select()
      this.$element.focus()
    }

  , mouseenter: function (e) {
      this.mousedover = true
      this.$menu.find('.active').removeClass('active')
      $(e.currentTarget).addClass('active')
    }

  , mouseleave: function (e) {
      this.mousedover = false
      if (!this.focused && this.shown) this.hide()
    }

  }


  /* TYPEAHEAD PLUGIN DEFINITION
   * =========================== */

  var old = $.fn.typeahead

  $.fn.typeahead = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('typeahead')
        , options = typeof option == 'object' && option
      if (!data) $this.data('typeahead', (data = new Typeahead(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.typeahead.defaults = {
    source: []
  , items: 8
  , menu: '<ul class="typeahead dropdown-menu"></ul>'
  , item: '<li><a href="#"></a></li>'
  , minLength: 0
  }

  $.fn.typeahead.Constructor = Typeahead


 /* TYPEAHEAD NO CONFLICT
  * =================== */

  $.fn.typeahead.noConflict = function () {
    $.fn.typeahead = old
    return this
  }


 /* TYPEAHEAD DATA-API
  * ================== */

  $(document).on('focus.typeahead.data-api', '[data-provide="typeahead"]', function (e) {
    var $this = $(this)
    if ($this.data('typeahead')) return
    $this.typeahead($this.data())
  })

}(window.jQuery);

/*
Mithril v0.1.30
http://github.com/lhorie/mithril.js
(c) Leo Horie
License: MIT
*/
var m=function a(b,c){function d(a){C=a.document,D=a.location,F=a.cancelAnimationFrame||a.clearTimeout,E=a.requestAnimationFrame||a.setTimeout}function e(){var a,b=[].slice.call(arguments),c=!(null==b[1]||K.call(b[1])!==G||"tag"in b[1]||"subtree"in b[1]),d=c?b[1]:{},e="class"in d?"class":"className",f={tag:"div",attrs:{}},g=[];if(K.call(b[0])!=I)throw new Error("selector in m(selector, attrs, children) should be a string");for(;a=L.exec(b[0]);)if(""===a[1]&&a[2])f.tag=a[2];else if("#"===a[1])f.attrs.id=a[2];else if("."===a[1])g.push(a[2]);else if("["===a[3][0]){var h=M.exec(a[3]);f.attrs[h[1]]=h[3]||(h[2]?"":!0)}g.length>0&&(f.attrs[e]=g.join(" "));var i=c?b[2]:b[1];f.children=K.call(i)===H?i:b.slice(c?2:1);for(var j in d)j===e?""!==d[j]&&(f.attrs[j]=(f.attrs[j]||"")+" "+d[j]):f.attrs[j]=d[j];return f}function f(a,b,d,e,j,l,m,n,o,p,q){if((null==j||null==j.toString())&&(j=""),"retain"===j.subtree)return l;var r=K.call(l),s=K.call(j);if(null==l||r!==s){if(null!=l)if(d&&d.nodes){var t=n-e,u=t+(s===H?j:l.nodes).length;i(d.nodes.slice(t,u),d.slice(t,u))}else l.nodes&&i(l.nodes,l);l=new j.constructor,l.tag&&(l={}),l.nodes=[]}if(s===H){for(var v=0,w=j.length;w>v;v++)K.call(j[v])===H&&(j=j.concat.apply([],j),v--);for(var x=[],y=l.length===j.length,z=0,A=1,B=2,D=3,E={},F=[],L=!1,v=0;v<l.length;v++)l[v]&&l[v].attrs&&null!=l[v].attrs.key&&(L=!0,E[l[v].attrs.key]={action:A,index:v});if(L){j.indexOf(null)>-1&&(j=j.filter(function(a){return null!=a}));var M=!1;if(j.length!=l.length)M=!0;else for(var O,P,v=0;O=l[v],P=j[v];v++)if(O.attrs&&P.attrs&&O.attrs.key!=P.attrs.key){M=!0;break}if(M){for(var v=0,w=j.length;w>v;v++)if(j[v]&&j[v].attrs)if(null!=j[v].attrs.key){var Q=j[v].attrs.key;E[Q]=E[Q]?{action:D,index:v,from:E[Q].index,element:l.nodes[E[Q].index]||C.createElement("div")}:{action:B,index:v}}else F.push({index:v,element:a.childNodes[v]||C.createElement("div")});var R=[];for(var S in E)R.push(E[S]);for(var T,U=R.sort(g),V=new Array(l.length),v=0;T=U[v];v++){if(T.action===A&&(i(l[T.index].nodes,l[T.index]),V.splice(T.index,1)),T.action===B){var W=C.createElement("div");W.key=j[T.index].attrs.key,a.insertBefore(W,a.childNodes[T.index]||null),V.splice(T.index,0,{attrs:{key:j[T.index].attrs.key},nodes:[W]})}T.action===D&&(a.childNodes[T.index]!==T.element&&null!==T.element&&a.insertBefore(T.element,a.childNodes[T.index]||null),V[T.index]=l[T.from])}for(var v=0,w=F.length;w>v;v++){var T=F[v];a.insertBefore(T.element,a.childNodes[T.index]||null),V[T.index]=l[T.index]}l=V,l.nodes=new Array(a.childNodes.length);for(var X,v=0;X=a.childNodes[v];v++)l.nodes[v]=X}}for(var v=0,Y=0,w=j.length;w>v;v++){var Z=f(a,b,l,n,j[v],l[Y],m,n+z||z,o,p,q);Z!==c&&(Z.nodes.intact||(y=!1),z+=Z.$trusted?(Z.match(/<[^\/]|\>\s*[^<]/g)||[]).length:K.call(Z)===H?Z.length:1,l[Y++]=Z)}if(!y){for(var v=0,w=j.length;w>v;v++)null!=l[v]&&x.push.apply(x,l[v].nodes);for(var $,v=0;$=l.nodes[v];v++)null!=$.parentNode&&x.indexOf($)<0&&i([$],[l[v]]);j.length<l.length&&(l.length=j.length),l.nodes=x}}else if(null!=j&&s===G){j.attrs||(j.attrs={}),l.attrs||(l.attrs={});var _=Object.keys(j.attrs),ab=_.length>("key"in j.attrs?1:0);if((j.tag!=l.tag||_.join()!=Object.keys(l.attrs).join()||j.attrs.id!=l.attrs.id)&&(l.nodes.length&&i(l.nodes),l.configContext&&typeof l.configContext.onunload===J&&l.configContext.onunload()),K.call(j.tag)!=I)return;var $,bb=0===l.nodes.length;if(j.attrs.xmlns?p=j.attrs.xmlns:"svg"===j.tag?p="http://www.w3.org/2000/svg":"math"===j.tag&&(p="http://www.w3.org/1998/Math/MathML"),bb?($=j.attrs.is?p===c?C.createElement(j.tag,j.attrs.is):C.createElementNS(p,j.tag,j.attrs.is):p===c?C.createElement(j.tag):C.createElementNS(p,j.tag),l={tag:j.tag,attrs:ab?h($,j.tag,j.attrs,{},p):j.attrs,children:null!=j.children&&j.children.length>0?f($,j.tag,c,c,j.children,l.children,!0,0,j.attrs.contenteditable?$:o,p,q):j.children,nodes:[$]},l.children&&!l.children.nodes&&(l.children.nodes=[]),"select"===j.tag&&j.attrs.value&&h($,j.tag,{value:j.attrs.value},{},p),a.insertBefore($,a.childNodes[n]||null)):($=l.nodes[0],ab&&h($,j.tag,j.attrs,l.attrs,p),l.children=f($,j.tag,c,c,j.children,l.children,!1,0,j.attrs.contenteditable?$:o,p,q),l.nodes.intact=!0,m===!0&&null!=$&&a.insertBefore($,a.childNodes[n]||null)),typeof j.attrs.config===J){var cb=l.configContext=l.configContext||{},db=function(a,b){return function(){return a.attrs.config.apply(a,b)}};q.push(db(j,[$,!bb,cb,l]))}}else if(typeof s!=J){var x;0===l.nodes.length?(j.$trusted?x=k(a,n,j):(x=[C.createTextNode(j)],a.nodeName.match(N)||a.insertBefore(x[0],a.childNodes[n]||null)),l="string number boolean".indexOf(typeof j)>-1?new j.constructor(j):j,l.nodes=x):l.valueOf()!==j.valueOf()||m===!0?(x=l.nodes,o&&o===C.activeElement||(j.$trusted?(i(x,l),x=k(a,n,j)):"textarea"===b?a.value=j:o?o.innerHTML=j:((1===x[0].nodeType||x.length>1)&&(i(l.nodes,l),x=[C.createTextNode(j)]),a.insertBefore(x[0],a.childNodes[n]||null),x[0].nodeValue=j)),l=new j.constructor(j),l.nodes=x):l.nodes.intact=!0}return l}function g(a,b){return a.action-b.action||a.index-b.index}function h(a,b,c,d,e){for(var f in c){var g=c[f],h=d[f];if(f in d&&h===g)"value"===f&&"input"===b&&a.value!=g&&(a.value=g);else{d[f]=g;try{if("config"===f||"key"==f)continue;if(typeof g===J&&0===f.indexOf("on"))a[f]=l(g,a);else if("style"===f&&null!=g&&K.call(g)===G){for(var i in g)(null==h||h[i]!==g[i])&&(a.style[i]=g[i]);for(var i in h)i in g||(a.style[i]="")}else null!=e?"href"===f?a.setAttributeNS("http://www.w3.org/1999/xlink","href",g):"className"===f?a.setAttribute("class",g):a.setAttribute(f,g):f in a&&"list"!==f&&"style"!==f&&"form"!==f&&"type"!==f?("input"!==b||a[f]!==g)&&(a[f]=g):a.setAttribute(f,g)}catch(j){if(j.message.indexOf("Invalid argument")<0)throw j}}}return d}function i(a,b){for(var c=a.length-1;c>-1;c--)if(a[c]&&a[c].parentNode){try{a[c].parentNode.removeChild(a[c])}catch(d){}b=[].concat(b),b[c]&&j(b[c])}0!=a.length&&(a.length=0)}function j(a){if(a.configContext&&typeof a.configContext.onunload===J&&a.configContext.onunload(),a.children)if(K.call(a.children)===H)for(var b,c=0;b=a.children[c];c++)j(b);else a.children.tag&&j(a.children)}function k(a,b,c){var d=a.childNodes[b];if(d){var e=1!=d.nodeType,f=C.createElement("span");e?(a.insertBefore(f,d||null),f.insertAdjacentHTML("beforebegin",c),a.removeChild(f)):d.insertAdjacentHTML("beforebegin",c)}else a.insertAdjacentHTML("beforeend",c);for(var g=[];a.childNodes[b]!==d;)g.push(a.childNodes[b]),b++;return g}function l(a,b){return function(c){c=c||event,e.redraw.strategy("diff"),e.startComputation();try{return a.call(b,c)}finally{ab()}}}function m(a){var b=Q.indexOf(a);return 0>b?Q.push(a)-1:b}function n(a){var b=function(){return arguments.length&&(a=arguments[0]),a};return b.toJSON=function(){return a},b}function o(){for(var a,b="all"===e.redraw.strategy(),c=0;a=T[c];c++)V[c]&&e.render(a,U[c].view?U[c].view(V[c]):$(),b);Y&&(Y(),Y=null),W=null,X=new Date,e.redraw.strategy("diff")}function p(a){return a.slice(db[e.route.mode].length)}function q(a,b,c){bb={};var d=c.indexOf("?");-1!==d&&(bb=u(c.substr(d+1,c.length)),c=c.substr(0,d));for(var f in b){if(f===c)return e.module(a,b[f]),!0;var g=new RegExp("^"+f.replace(/:[^\/]+?\.{3}/g,"(.*?)").replace(/:[^\/]+/g,"([^\\/]+)")+"/?$");if(g.test(c))return c.replace(g,function(){for(var c=f.match(/:[^\/]+/g)||[],d=[].slice.call(arguments,1,-2),g=0,h=c.length;h>g;g++)bb[c[g].replace(/:|\./g,"")]=decodeURIComponent(d[g]);e.module(a,b[f])}),!0}}function r(a){if(a=a||event,!a.ctrlKey&&!a.metaKey&&2!==a.which){a.preventDefault?a.preventDefault():a.returnValue=!1;var b=a.currentTarget||this,c="pathname"===e.route.mode&&b.search?u(b.search.slice(1)):{};e.route(b[e.route.mode].slice(db[e.route.mode].length),c)}}function s(){"hash"!=e.route.mode&&D.hash?D.hash=D.hash:b.scrollTo(0,0)}function t(a,b){var c=[];for(var d in a){var e=b?b+"["+d+"]":d,f=a[d],g=K.call(f),h=null!=f&&g===G?t(f,e):g===H?f.map(function(a){return encodeURIComponent(e+"[]")+"="+encodeURIComponent(a)}).join("&"):encodeURIComponent(e)+"="+encodeURIComponent(f);c.push(h)}return c.join("&")}function u(a){for(var b=a.split("&"),c={},d=0,e=b.length;e>d;d++){var f=b[d].split("=");c[decodeURIComponent(f[0])]=f[1]?decodeURIComponent(f[1]):""}return c}function v(a){var b=m(a);i(a.childNodes,R[b]),R[b]=c}function w(a){var b=e.prop();return a.then(b),b.then=function(b,c){return w(a.then(b,c))},b}function x(a,b){function c(a){l=a||j,n.map(function(a){l===i&&a.resolve(m)||a.reject(m)})}function d(a,b,c,d){if((null!=m&&K.call(m)===G||typeof m===J)&&typeof a===J)try{var f=0;a.call(m,function(a){f++||(m=a,b())},function(a){f++||(m=a,c())})}catch(g){e.deferred.onerror(g),m=g,c()}else d()}function f(){var j;try{j=m&&m.then}catch(n){return e.deferred.onerror(n),m=n,l=h,f()}d(j,function(){l=g,f()},function(){l=h,f()},function(){try{l===g&&typeof a===J?m=a(m):l===h&&"function"==typeof b&&(m=b(m),l=g)}catch(f){return e.deferred.onerror(f),m=f,c()}m===k?(m=TypeError(),c()):d(j,function(){c(i)},c,function(){c(l===g&&i)})})}var g=1,h=2,i=3,j=4,k=this,l=0,m=0,n=[];k.promise={},k.resolve=function(a){return l||(m=a,l=g,f()),this},k.reject=function(a){return l||(m=a,l=h,f()),this},k.promise.then=function(a,b){var c=new x(a,b);return l===i?c.resolve(m):l===j?c.reject(m):n.push(c),c.promise}}function y(a){return a}function z(a){if(!a.dataType||"jsonp"!==a.dataType.toLowerCase()){var d=new b.XMLHttpRequest;if(d.open(a.method,a.url,!0,a.user,a.password),d.onreadystatechange=function(){4===d.readyState&&(d.status>=200&&d.status<300?a.onload({type:"load",target:d}):a.onerror({type:"error",target:d}))},a.serialize===JSON.stringify&&a.data&&"GET"!==a.method&&d.setRequestHeader("Content-Type","application/json; charset=utf-8"),a.deserialize===JSON.parse&&d.setRequestHeader("Accept","application/json, text/*"),typeof a.config===J){var e=a.config(d,a);null!=e&&(d=e)}var f="GET"!==a.method&&a.data?a.data:"";if(f&&K.call(f)!=I&&f.constructor!=b.FormData)throw"Request data should be either be a string or FormData. Check the `serialize` option in `m.request`";return d.send(f),d}var g="mithril_callback_"+(new Date).getTime()+"_"+Math.round(1e16*Math.random()).toString(36),h=C.createElement("script");b[g]=function(d){h.parentNode.removeChild(h),a.onload({type:"load",target:{responseText:d}}),b[g]=c},h.onerror=function(){return h.parentNode.removeChild(h),a.onerror({type:"error",target:{status:500,responseText:JSON.stringify({error:"Error making jsonp request"})}}),b[g]=c,!1},h.onload=function(){return!1},h.src=a.url+(a.url.indexOf("?")>0?"&":"?")+(a.callbackKey?a.callbackKey:"callback")+"="+g+"&"+t(a.data||{}),C.body.appendChild(h)}function A(a,b,c){if("GET"===a.method&&"jsonp"!=a.dataType){var d=a.url.indexOf("?")<0?"?":"&",e=t(b);a.url=a.url+(e?d+e:"")}else a.data=c(b);return a}function B(a,b){var c=a.match(/:[a-z]\w+/gi);if(c&&b)for(var d=0;d<c.length;d++){var e=c[d].slice(1);a=a.replace(c[d],b[e]),delete b[e]}return a}var C,D,E,F,G="[object Object]",H="[object Array]",I="[object String]",J="function",K={}.toString,L=/(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g,M=/\[(.+?)(?:=("|'|)(.*?)\2)?\]/,N=/^(AREA|BASE|BR|COL|COMMAND|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TRACK|WBR)$/;d(b);var O,P={appendChild:function(a){O===c&&(O=C.createElement("html")),C.documentElement&&C.documentElement!==a?C.replaceChild(a,C.documentElement):C.appendChild(a),this.childNodes=C.childNodes},insertBefore:function(a){this.appendChild(a)},childNodes:[]},Q=[],R={};e.render=function(a,b,d){var e=[];if(!a)throw new Error("Please ensure the DOM element exists before rendering a template into it.");var g=m(a),h=a===C,j=h||a===C.documentElement?P:a;h&&"html"!=b.tag&&(b={tag:"html",attrs:{},children:b}),R[g]===c&&i(j.childNodes),d===!0&&v(a),R[g]=f(j,null,c,c,b,R[g],!1,0,null,c,e);for(var k=0,l=e.length;l>k;k++)e[k]()},e.trust=function(a){return a=new String(a),a.$trusted=!0,a},e.prop=function(a){return(null!=a&&K.call(a)===G||typeof a===J)&&typeof a.then===J?w(a):n(a)};var S,T=[],U=[],V=[],W=null,X=0,Y=null,Z=16;e.module=function(a,b){if(!a)throw new Error("Please ensure the DOM element exists before rendering a template into it.");var c=T.indexOf(a);0>c&&(c=T.length);var d=!1;if(V[c]&&typeof V[c].onunload===J){var f={preventDefault:function(){d=!0}};V[c].onunload(f)}if(!d){e.redraw.strategy("all"),e.startComputation(),T[c]=a;var g=S=b=b||{},h=new(b.controller||function(){});return g===S&&(V[c]=h,U[c]=b),ab(),V[c]}},e.redraw=function(a){W&&a!==!0?(new Date-X>Z||E===b.requestAnimationFrame)&&(W>0&&F(W),W=E(o,Z)):(o(),W=E(function(){W=null},Z))},e.redraw.strategy=e.prop();var $=function(){return""},_=0;e.startComputation=function(){_++},e.endComputation=function(){_=Math.max(_-1,0),0===_&&e.redraw()};var ab=function(){"none"==e.redraw.strategy()?(_--,e.redraw.strategy("diff")):e.endComputation()};e.withAttr=function(a,b){return function(c){c=c||event;var d=c.currentTarget||this;b(a in d?d[a]:d.getAttribute(a))}};var bb,cb,db={pathname:"",hash:"#",search:"?"},eb=function(){};return e.route=function(){if(0===arguments.length)return cb;if(3===arguments.length&&K.call(arguments[1])===I){var a=arguments[0],c=arguments[1],d=arguments[2];eb=function(b){var f=cb=p(b);q(a,d,f)||e.route(c,!0)};var f="hash"===e.route.mode?"onhashchange":"onpopstate";b[f]=function(){var a=D[e.route.mode];"pathname"===e.route.mode&&(a+=D.search),cb!=p(a)&&eb(a)},Y=s,b[f]()}else if(arguments[0].addEventListener){{var g=arguments[0];arguments[1],arguments[2]}g.href=("pathname"!==e.route.mode?D.pathname:"")+db[e.route.mode]+this.attrs.href,g.removeEventListener("click",r),g.addEventListener("click",r)}else if(K.call(arguments[0])===I){var h=cb;cb=arguments[0];var i=arguments[1]||{},j=cb.indexOf("?"),k=j>-1?u(cb.slice(j+1)):{};for(var l in i)k[l]=i[l];var m=t(k),n=j>-1?cb.slice(0,j):cb;m&&(cb=n+(-1===n.indexOf("?")?"?":"&")+m);var o=(3===arguments.length?arguments[2]:arguments[1])===!0||h===arguments[0];b.history.pushState?(Y=function(){b.history[o?"replaceState":"pushState"](null,C.title,db[e.route.mode]+cb),s()},eb(db[e.route.mode]+cb)):D[e.route.mode]=cb}},e.route.param=function(a){if(!bb)throw new Error("You must call m.route(element, defaultRoute, routes) before calling m.route.param()");return bb[a]},e.route.mode="search",e.deferred=function(){var a=new x;return a.promise=w(a.promise),a},e.deferred.onerror=function(a){if("[object Error]"===K.call(a)&&!a.constructor.toString().match(/ Error/))throw a},e.sync=function(a){function b(a,b){return function(e){return g[a]=e,b||(c="reject"),0===--f&&(d.promise(g),d[c](g)),e}}var c="resolve",d=e.deferred(),f=a.length,g=new Array(f);if(a.length>0)for(var h=0;h<a.length;h++)a[h].then(b(h,!0),b(h,!1));else d.resolve([]);return d.promise},e.request=function(a){a.background!==!0&&e.startComputation();var b=e.deferred(),c=a.dataType&&"jsonp"===a.dataType.toLowerCase(),d=a.serialize=c?y:a.serialize||JSON.stringify,f=a.deserialize=c?y:a.deserialize||JSON.parse,g=a.extract||function(a){return 0===a.responseText.length&&f===JSON.parse?null:a.responseText};return a.url=B(a.url,a.data),a=A(a,a.data,d),a.onload=a.onerror=function(c){try{c=c||event;var d=("load"===c.type?a.unwrapSuccess:a.unwrapError)||y,h=d(f(g(c.target,a)));if("load"===c.type)if(K.call(h)===H&&a.type)for(var i=0;i<h.length;i++)h[i]=new a.type(h[i]);else a.type&&(h=new a.type(h));b["load"===c.type?"resolve":"reject"](h)}catch(c){e.deferred.onerror(c),b.reject(c)}a.background!==!0&&e.endComputation()},z(a),b.promise(a.initialValue),b.promise},e.deps=function(a){return d(b=a||b),b},e.deps.factory=a,e}("undefined"!=typeof window?window:{});"undefined"!=typeof module&&null!==module&&module.exports?module.exports=m:"function"==typeof define&&define.amd&&define(function(){return m});
//# sourceMappingURL=mithril.min.js.map

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