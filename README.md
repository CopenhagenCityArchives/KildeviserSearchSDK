[![Build Status](https://travis-ci.org/CopenhagenCityArchives/KildeviserSearchSDK.svg?branch=master)](https://travis-ci.org/CopenhagenCityArchives/KildeviserSearchSDK)

KildeviserSearchSDK
===================
About
-----
KildeviserSDK is a Javascript-script that enable users to find units avaiable through [APACS](https://github.com/copenhagencityarchives/apacs).
This is done by showing two or three forms in which the user selects related filters. When all filters is selected, the application redirects to the corresponding page in [Kildeviseren](https://github.com/copenhagencityarchives/kildeviseren)

Installation
------------

Get dependencies with `npm install`

Building
--------

Run `gulp build` or `gulp buildDev`


Development
-----------

To start a development server, run `gulp watch`

Profiles
--------
Two profiles are supported: *kbharkiv* and *frederiksberg*.
Set different profiles using the --profile flag while building.
Set profile preferences in the js-files in /profiles

Usage
-----
To use the application add the following:
 ```
  //initialize the application
  $(function(){
    KildeViserSearchSDK.init(11, 'my-div');
  });
  ```
  Where "11" is the id of collection you need to search in, and "my-div" is the div/container which will hold the forms.
