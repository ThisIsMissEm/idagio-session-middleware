# @idagio/session-middleware

A very opinionated middleware for creating and managing session cookies.

This module builds off the shoulders of [`@idagio/cookie-middleware`](https://github.com/idagio/idagio-cookie-middleware) to provide a very simply interface to working with sessions. This module doesn't concern itself with storage or validation of sessions, that is left to the user.

All that this module gives you is a way to ensure that there is always a `request.session.token` value, and a method for resetting that value to be something different.

## Usage

```js
var express = require('express');
var Cookies = require('@idagio/cookie-middleware');
var Session = require('@idagio/session-middleware');

var app = express()

app.use(Cookies.middleware);
app.use(Session.middleware);

app.get('/', function(request, response) {
  response.writeHead(200);
  response.end('Your session token is: ' + request.session.token);
});

app.get('/reset', function(request, response) {
  request.session.reset();
  response.redirect('/');
});

app.listen(3000);
```

You can also use the constructor bare, just like [`@idagio/cookie-middleware`](https://github.com/idagio/idagio-cookie-middleware):

```js
var session = new Session(request.cookies, 'my_session_name');
```

By default, `Session.middleware` uses the session name of `_session`, you can override this by writing your own version of the middleware that initializes the Session constructor directly (it's four lines of code), e.g.,

```js
function SessionMiddleware(request, response, next) {
  request.my_awesome_session = new Session(request.cookies, 'my_awesome_session');
  next();
};

// app.use(SessionMiddleware);
```

### Important details around security

You will often use the `request.session.token` value to store some information in a database or in memory, such that you can use the session token to retrieve that information at a later point in time. In order to prevent [Session Fixation](https://www.owasp.org/index.php/Session_fixation), you should **ALWAYS** do a `request.session.reset()` before changing the value of the session.

For example, on login:

1. Carry out whatever logic you have to authenticate the details provided for a user
2. Call `request.session.reset()` to get a new session token
3. Store the pairing of user details with `request.session.token` in your database (e.g., redis)

You should probably also expire sessions in your storage after a given number of days of inactivity.

## API

### `new Session(cookies, [ name ])`

Creates a new instance of the Session handler; `cookies` is expected to be something that conforms to the API which [`@idagio/cookie-middleware`](https://github.com/idagio/idagio-cookie-middleware) exposes. Optionally, you can specify a name for the cookie that the session will be stored in, this defaults to `'_session'`.

#### `Session.prototype.reset()`

Generates a new token value, and sets that as the session cookies' value.

## Security

This module uses [cryptiles](https://github.com/hapijs/cryptiles) for creating random values. At present, the session token is generated using `cryptiles.randomString(256)`.

If you would like to comment privately on the security aspects of this module, please email `Em Smith – ms@idagio.com`.
