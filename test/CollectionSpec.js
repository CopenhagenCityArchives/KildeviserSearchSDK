
describe("filters", function(){

    var col = {};
    var filters = {};

    beforeEach(function() {
        col = new Collection(1);
        filters = { levels : [{id: 1, name: 'hello1', searchable: true}, {id: 2, name : 'hello2', searchable: false}]};
    });

    describe("loading filters", function(){
    	it("should load searchable filters from data", function(){
	    	
            col._loadData(filters);

	    	expect(col.filters.length).toEqual(1);
    	});
    });

    xdescribe("updating filters", function(){
        it("should not get data if the filter does not exist", function(){
            col._loadData(filters);
            col.updateFilters("hello1", "1");
            expect(col.filters.length).toBe(2);

        });
    });
});


  //  mock = m.deps(mock.window);

/*    describe("first test", function(){
        it("should initialize the mock object", function(){



            var prop = m.request({method: "GET", url: "test"});

            var xhr = mock.XMLHttpRequest.$instances.pop("test");
            xhr.data = "data" //populate mock response object
            xhr.onreadystatechange();

            expect(prop() == "data");
        });
    });*/