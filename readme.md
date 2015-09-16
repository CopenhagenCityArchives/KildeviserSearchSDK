#KildeViserSearchSDK
A JavaScript SDK used for searching the collections of Copenhagen City Archives using the public available API.

##Usage
Include the minified file on your website, and Twitter Bootstrap 3 for the looks.

Get the id of the collection you want to search in (in this example we use collection id 2), and put it in a div on your website.
Here's an example:
`KildeViserSearchSDK.init(2, 'example');`

##Required libraries
The SDK is based on [Mithril.js](https://lhorie.github.io/mithril/) and Twitter Bootstrap 3 for the looks. The TypeAhead is based on the Bootstrap Typeahead in a slightly modified version, which can be found [here] (http://blog.redtigersoftware.com/2013/04/twitter-bootstrap-typeahead-show-all-on.html).


External libraries included in the minified file:
* bootstrap-typeahead-0len.js
* mitril.min.js

##The API
More information about the API used by this SDK can be found here: http://www.kbhkilder.dk/api/info.html.

Information about the specific collections by using the collection id, here for example collection 2: http://www.kbhkilder.dk/api/collections/2/info
