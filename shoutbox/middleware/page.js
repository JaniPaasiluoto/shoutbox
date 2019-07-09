'use strict';

module.exports = (cb, perpage) => {
  perpage = perpage || 10; //defaults to 10 per page
  return (req, res, next) => { //returns middleware function
    let page = Math.max(
      parseInt(req.params.page || '1', 10),
      1
    ) - 1; //parses page param as a base 10 integer
    cb((err, total) => { //invokes the function passed
      if (err) return next(err); //delegates errors
        req.page = res.locals.page = { //stores page properties for future reference
            number: page,
            perpage: perpage,
            from: page * perpage,
            to: page * perpage + perpage - 1,
            total: total,
            count: Math.ceil(total / perpage)
        };
        next(); //passes control to next middleware component
    });
  }
};
