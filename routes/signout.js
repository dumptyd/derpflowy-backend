const router = require('express').Router();
const signoutRoute = function () {
  router.get('/', function (req, res) {
    req.logout();
    res.redirect('/');
  });
  return router;
};
module.exports = signoutRoute;