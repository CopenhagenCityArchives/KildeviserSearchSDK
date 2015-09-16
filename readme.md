#KildeViserSearchSDK
A JavaScript SDK used for searching the collections of Copenhagen City Archives using the public available API.

##Usage
Include the minified file on your website.


Get the id of the collection you want to search in (in this example we use collection id 2), and put it in a div on your website.
Here's an example:
`KildeViserSearchSDK.init(2, 'example');`

##Required libraries
bootstrap.css

jquery.js

External libraries include in the minified file:
bootstrap-typeahead-0len.js

mitril.min.js

##The API
More information about the API used by this SDK can be found here: http://www.kbhkilder.dk/api/info.html and information about the specific collections by using the collection id, here for example collection 2: http://www.kbhkilder.dk/api/collections/2/info
