mock = m.deps(mock.window);
//Creating a fake body element
var body = mock.document.createElement("body");
mock.document.body = body;

describe("filters", function(){

    var filter = {};

    var data = {
            name: "test",
            required_levels: ["level1", "level2"]
    };

    var filterValues = [ 

    ];

    beforeEach(function(){
        filter = new Filter(1, data);
        filterValues = [
            { name: "level1", value: "test2" },
            { name: "level2", value: 1 }
        ];
    });

    describe("init", function(){
    	it("should put data in getter/setter", function(){
	    	expect(filter.name()).toEqual(data.name);
    	});

        it("should have an empty selected value", function(){
            expect(filter.selectedValue()).toEqual("");
        });        

        it("should handle empty required_levels", function(){
            var data2 = {
                name : "test",
                required_levels: undefined
            };

            filter = new Filter(1, data2);

            expect(filter.requiredLevels).toEqual([]);
        });        
    });

    describe("required levels", function(){
        it("should return true when all required levels have data", function(){
            expect(filter._requiredFiltersSet(filterValues)).toBe(true);
        });

        it("should return false when required levels are missing", function(){
            filterValues[0].value = "";
            expect(filter._requiredFiltersSet(filterValues)).toBe(false);
            
            filterValues[0].value = undefined;
            expect(filter._requiredFiltersSet(filterValues)).toBe(false);
        });
    });

    describe("get JSONP data", function(){
        it("should load JSON from document element", function(){
            // script tags cannot be appended directly on the document
            var body = mock.document.createElement("body")
            mock.document.body = body
            mock.document.appendChild(body)

            var error = m.prop("no error")
            var data
            var req = m.request({url: "/test", dataType: "jsonp"}).then(function(received) {data = received}, error)
            var callbackKey = Object.keys(mock).filter(function(globalKey){
                return globalKey.indexOf("mithril_callback") > -1
            }).pop()
            var scriptTag = [].slice.call(mock.document.getElementsByTagName("script")).filter(function(script){
                return script.src.indexOf(callbackKey) > -1
            }).pop()
            mock[callbackKey]({foo: "bar"})
            mock.document.removeChild(body)
            //expect(scriptTag.src.indexOf("/test?callback=mithril_callback")).toBe().largerThan(-1)
            expect(data.foo).toEqual("bar")
        });
    });

    describe("update possible values", function(){
        it("should get possible values if required levels are set", function(){
            expect(filter.values).toEqual([]);

            var prop = m.request({method: "GET", url: ""});

            var xhr = mock.XMLHttpRequest.$instances.pop();

            xhr.data = [{text: "test1"}, {text: "test2"}]; //populate mock response object
            xhr.onreadystatechange();
            //filter.updateValues(filterValues);  
            
            expect(filter.values).toEqual(["test1", "test2"]);     
        });

        it("should set selectedValue if only 1 possible value is given", function(){
            expect(filter.values).toEqual([]);

            var prop = m.request({method: "GET", url: ""});
            var xhr = mock.XMLHttpRequest.$instances.pop();

            xhr.data = [{text: "test1"}, {text: "test2"}]; //populate mock response object
            xhr.onreadystatechange();
            filter.updateValues(filterValues);  
              

            expect(filter.selectedValue()).toEqual("test1");     
        });        

        xit("should get possible values if the filter has no required levels", function(){
            var data2 = {
                name : "test",
                required_levels: undefined
            };

            filter = new Filter(1, data2);

            filter.updateValues([]);
        });
    });

    describe("values to string", function(){
        it("should convert a given input of values to a string", function(){
            var values = ["test1", "test2"];
            expect(filter._valuesToString(values)).toEqual('["test1","test2"]');

            values = [];
            expect(filter._valuesToString(values)).toEqual('[]');            
        });
    });
});