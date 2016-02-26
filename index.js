var cryptiles = require('cryptiles');

function generateToken() {
  return cryptiles.randomString(256);
}

function setCookie() {
  this.cookies.set(this.name, this.token, {
    path: '/',
    httpOnly: true,
    secure: process.env.ENV === 'production'
  }, true);
}

function Session(cookies, name) {
  this.cookies = cookies;
  this.name = name || '_session';

  this.token = this.cookies.get(this.name);
  if (!this.token) {
    this.token = generateToken();
  }

  // Always update the cookie, as to have a rolling expiry
  setCookie.call(this);
}

Session.prototype.reset = function reset() {
  this.token = generateToken();
  setCookie.call(this);
};

Session.middleware = function SessionMiddleware(request, response, next) {
  request.session = new Session(request.cookies);
  next();
};
