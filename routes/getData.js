const router = require('express').Router(),
  dataRoute = function (isLoggedIn, User) {
    router.get('/', isLoggedIn, function (req, res) {
      User.findById(req.user._id, function (err, user) {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        }
        else if (!user || err) res.sendStatus(403);
        else res.status(200).send({
          list: user.list
        });
      });
    });
    return router;
  };
module.exports = dataRoute;