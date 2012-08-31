abr-2012
========

Necessary Meteor Packages:
    bootstrap
    accounts-ui
    accounts-google
    accounts-password
    accounts-email
    accounts-facebook

Install Steps:
* Update providers-dist.js and server/provider_secret-dist.js
  to remove the -dist from their names.  Also update the files
  replaceing all of the GOOGLE_ strings with strings from your
  google app api.
