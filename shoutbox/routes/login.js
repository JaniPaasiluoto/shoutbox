const User = require('../models/user');

exports.form = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.submit = (req, res, next) => {
  const data = req.body.user;
  User.authenticate(data.name, data.pass, (err, user) => { //check credentials
    if (err) return next(err); //delegates errors
    if (user) { // handles a user with valid credentials
      req.session.uid = user.id; //stores uid for authentication
      res.redirect('/'); //redirects to entry listing
    } else {
      res.error('Sorry! Invalid credentials. '); //exposes an error message
      res.redirect('back'); //redirects back to login form
    }
  });
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect('/');
  })
};
