[![Build Status](https://travis-ci.org/omedale/DOCME-CP2.svg?branch=chore%2Fthird-feedback-push)](https://travis-ci.org/omedale/DOCME-CP2)
[![Coverage Status](https://coveralls.io/repos/github/omedale/DOCME-CP2/badge.svg?branch=chore%2Fthird-feedback-push)](https://coveralls.io/github/omedale/DOCME-CP2?branch=chore%2Fthird-feedback-push)
[![Code Climate](https://codeclimate.com/github/omedale/DOCME-CP2/badges/gpa.svg)](https://codeclimate.com/github/omedale/DOCME-CP2)

# Introduction
DocMe is full stack document management system which uses roles and priviledges to categorize documents. To access any document you must have access rights and you must have a role. The document are also arranged based on date created.

# Basic Features
<ul>
<li>Users can view documents based on access rights</li>
<li>Users can search for documents based on access rights</li>
<li>Users can create document and specify rights</li>
<li>User can edit document based on priviledges and access rights</li>
<li>User can delete document</li>
<li>Admin User can search for documents</li>
<li>Admin user get list users by page</li>
<li>User get list documents by page</li>
</ul>

# Endpoints

$ Please click **[here](https://docme.herokuapp.com)** to view all available endpoints

# System Dependencies

*  **[Chai](https://www.npmjs.com/package/chai)** - Chai is used together with jasmine to test this application
*  **[Gulp](https://www.npmjs.com/package/gulp)** - Was used for task runner
*  **[Gulp-bable](https://www.npmjs.com/package/gulp-babel)** - Transpile codes in ES6 to ES5
*  **[gulp-istanbul](https://www.npmjs.com/package/gulp-istanbul)** - to generate coverage file
*  **[Gulp-Jasmine](https://www.npmjs.com/package/gulp-jasmine)** - It enables us to test all the endpoints and controllers
*  **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)** - It was used user authriaztion and authentication
*  **[sequelize](https://www.npmjs.com/package/sequelize)** - Used for ORMs database
*  **[babel-cli](https://www.npmjs.com/package/babel-cli)** - It enables the app scripts to be tested with babel from the command line
*  The following depencies are required by the app during developmment
  *  **[eslint](https://www.npmjs.com/package/eslint)** - This is a javascript syntax highlighter used to highligh syntax error during the development of this app
  * **[gulp-nodemon](https://www.npmjs.com/package/gulp-nodemon)** - to watch the files in the directory for any files change
  * **[supertest](https://www.npmjs.com/package/supertest)** - to run endpoint test

# Dependencies

*  **[babel-core](https://www.npmjs.com/package/babel-core)** - It compiles es6 used in the app to es5
*  **[babel-eslint](https://www.npmjs.com/package/babel-eslint)** - Used with ESlint to lint syntax errors
*  **[Babel-register](https://www.npmjs.com/package/babel-register)** - This framework helps to compile from es6 to es5
*  **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Used to hash user's password
*  **[coveralls](https://www.npmjs.com/package/coveralls)** - Display test coverage
*  **[dotenv](https://www.npmjs.com/package/dotenv)** - To protect secret ID
*  **[Express](https://expressjs.com/)** - Express is Node.js web application framework
* **[path](https://www.npmjs.com/package/nodemon)** - to get paths during production


# Installation

    - clone the project to new folder, copy and paste the commands below on your terminal
    $ git clone https://github.com/omedale/DOCME-CP2.git

    -install dependencies
    $ npm install

    -start the project
    $ npm start


# Tests
*  The tests have been written using Gulp-Jasmine and Chai.
*  They are run using the **`coverage`** tool in order to generate test coverage reports.

     -To run test

         $ npm test

# Contributing
If you are planning on contributing to DocMe, that's great. I welcome contributions to DocMe.
If the contribution you wish to make isn't documented in an existing issue, please create an issue, before you submit a Pull Request. This will allow me and Collaborators a chance to give additional feedback as well. **[Click](https://github.com/omedale/DOCME-CP2/wiki)** here for more information on how to contribute.

# FAQ

## Do I need to pay to use the APIs ?

No, its free for everyone.

## How do I connect to the APIs?

You need to request a resource from one of the endpoints using HTTPS. Generally, reading any data is done through a request with GET method. If you want our server to create, update or delete a given resource, POST or PUT methods are required.

## What return formats do you support?

DocMe APIs currently returns data in ```JSON``` format.

## What kind of authentication is required?

All endpints except login and signup are protected. Users requre ```token``` to access all protected endpoints. ```Token``` is sent to client after successful signup and login. Token must be set as authorization in the ```http request header``` to access the protected routes

# Limitations
The application uses shared database package, this may lead to slow in response at some point. It also has query limit per day, once exceeded client won't get any response till the next day.

# License

(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# Author
Oluwafemi Medale - @omedale