describe("URL Builder", function() {

    var ub = {};
    var baseUrl = 'http://test.com';
    var simpleFilters = [new FilterValue('name', 'value')];
    var filtersSpecialCharacters = [new FilterValue('name', 'å')];

    beforeEach(function() {
        ub = new URLBuilder();
    });

    describe("build URL", function() {
        it("should return a URL based on given filters", function() {

            var url = ub.buildUrl(baseUrl, simpleFilters);

            expect(url).toEqual(baseUrl + '?name=value');
        });

        it("should return a handle special characters", function() {

            var url = ub.buildUrl(baseUrl, filtersSpecialCharacters);

            expect(url).toEqual(baseUrl + '?name=%C3%A5');
        });
    });
});
