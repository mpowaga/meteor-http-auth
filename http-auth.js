function unauthorized(res, realm) {
  res.statusCode = 401;
  res.setHeader('WWW-Authenticate', 'Basic realm="' + realm + '"');
  res.end('Unauthorized');
}


function error(code, msg) {
  var err = new Error(msg || code);
  err.status = code;
  return err;
}


function auth(callbacks, realm = 'Authorization Required') {
  return function(req, res, next) {
    const authorization = req.headers.authorization;

    if (req.user) return next();
    if (!authorization) return unauthorized(res, realm);

    const parts = authorization.split(' ');

    if (parts.length !== 2) return next(error(400));

    const scheme = parts[0];
    const token = parts[1];
    const callback = callbacks[scheme];

    if (typeof callback !== 'function') return next(error(400));

    if (callback.length >= 3) {
      callback(token, function(err, user) {
        if (err || !user) return unauthorized(res, realm);
        req.user = req.remoteUser = user;
        next();
      })
    } else {
      const user = callback(token);
      if (user) {
        req.user = req.remoteUser = user;
        next();
      } else {
        unauthorized(res, realm);
      }
    }
  }
}

export default class HttpAuth {
  constructor(callbacks, realm) {
    this.callbacks = callbacks;
    this.realm = realm;
  }

  protect(routes = ['']) {
    if (!_.isArray(routes))
      throw new Error("'routes' must be an array of route Strings");
    
    routes.forEach((route, i) =>
      WebApp.connectHandlers.stack.splice(i, 0, {
        route,
        handle: auth(this.callbacks, this.realm),
      })
    );
  }
}