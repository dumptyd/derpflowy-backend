const router = require('express').Router();
const createCollabRoute = function (isLoggedIn, Collab) {
    router.post('/', isLoggedIn, function (req, res) {
      let collab = {};
      if(req.body && req.body.list){
        collab.list = req.body.list;
      }
      Collab.create(collab, function(err, createdCollab){
        return res.status(200).send({room: createdCollab._id});
      });
    });
    return router;
  };
module.exports = createCollabRoute;