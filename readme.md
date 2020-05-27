# KildeViserSearchSDK
A JavaScript SDK used for searching the collections of Copenhagen City Archives using the public available API.

## Usage
Include [the minified file](http://www.kbhkilder.dk/software/KildeviserSearchSDK/beta/KildeviserSearchSDK.min.js) on your website, and Twitter Bootstrap 2.3 for the looks.

Get the id of the collection you want to search in (in this example we use collection id 2), and put it in a div on your website.
Here's an example for collection id 2 and div with id 'example':
`KildeViserSearchSDK.init(2, 'example');`


## Required libraries
The SDK is based on [Mithril.js](https://lhorie.github.io/mithril/) and Twitter Bootstrap 3.
The select functionality is based on [Select2](https://select2.github.io/)

External libraries included in the minified file:
* select2.min.js
* mitril.min.js

## The API
More information about the API used by this SDK can be found here: http://www.kbhkilder.dk/api/info.html.

Information about the specific collections can be found by using the collection id, here for example collection 2: http://www.kbhkilder.dk/api/collections/2/info

## Building and testing
To build and test the code run `gulp watch`, and go to http://localhost:8080/examples/example.html

To minify the source code run `gulp build`.

To run the tests (using Karma) run `karma start`.

### Profiles

Build profiles are selected with the flag `--profile <PROFILE>`, for example `gulp build --profile kbharkiv`.

By default `kbharkiv` is selected.

In the `./profile` directory exists configuration files named by the profile names, each defining a
`ProfileConfiguration` function returning a configuration object for the profile.

The valid profile names are hardcoded into `gulpfile.js`.