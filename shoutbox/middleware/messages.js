const express = require('express');

//adds messages to a session variable so they don't vanish after res.locals is reset after redirect
function message(req) {
  return (msg, type) => {
    type = type || 'info';
    let sess = req.session;
    sess.messages = sess.messages || [];
    sess.messages.push({ type: type, string: msg});
  };
};

module.exports = (req, res, next) => {
  res.message = message(req);
  res.error = (msg) => {
    return res.message(msg, 'error');
  };
  res.locals.messages = req.session.messages || []; //message template variable to store session's messages. It's an array that may or may not exist from the previous request
  res.locals.removeMessages = () => { //we have to remove the messages from the session; otherwise they'll build up because nothing's clearing them
    req.session.messages = [];
  };
  next();
};
