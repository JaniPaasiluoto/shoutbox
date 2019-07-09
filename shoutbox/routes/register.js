const User = require('../models/user');

exports.form = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.submit = (req, res, next) => {
  const data = req.body.user;
  User.getByName(data.name, (err, user) => { //checks whether username is unique
    if (err) return next(err); //defers database connection errors and other errors
    //redis will default it
    if (user.id) { //username is already taken
      res.error('Username already taken!');
      res.redirect('back');
    } else {
      user = new User({ //creates a user with POST data
        name: data.name,
        pass: data.pass
      });
      user.save((err) => { //saves new user
        if (err) return next(err);
        req.session.uid = user.id; //stores uid for authentication
        res.redirect('/'); //redirects to entry listing page
      });
    }
  });
};
