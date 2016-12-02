const router = require('express').Router(),
  updateDataRoute = function (isLoggedIn, User) {
    router.post('/', isLoggedIn, function (req, res) {
      User.findById(req.user._id, function (err, user) {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        }
        else if (!user || err || !req.body.list) res.sendStatus(403);
        else {
          user.list = req.body.list;
          user.save();
          res.sendStatus(200);
        }
      });
    });
    return router;
  };
module.exports = updateDataRoute;