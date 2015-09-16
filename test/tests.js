
function testMithril(mockWindow) {
    mock = m.deps(mockWindow);

    // Your tests here...
    describe("first test", function(){
		it("should initialize the mock object", function(){
			var prop = m.request({method: "GET", url: "test", data: {foo: [1, 2]}})
			mock.XMLHttpRequest.$instances.pop().onreadystatechange();

			console.log(mock);

			expect(mock).toBe.not.Null();
		});
    });
}

testMithril(mock);