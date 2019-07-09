const User = require('../models/user');

module.exports = (req, res, next) => {
  if (req.remoteUser) { //adds possibility to add entries via API
    res.locals.user = req.remoteUser;
  }
  const uid = req.session.uid; //gets logged-in user ID from session
  if (!uid) return next();
  User.get(uid, (err, user) => { //gets logged-in user's data from Redis
    if (err) return next(err);
    req.user = res.locals.user = user; //exposes user data to response object
    next();
  });
};
