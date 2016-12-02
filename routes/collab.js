const router = require('express').Router();
const createCollabRoute = function (Collab, nsp) {
    router.get('/:id', function (req, res) {
      res.render('collab');
    });
    router.get('/:id/getData', function (req, res) {
      Collab.findById(req.params.id, function(err, collab){
        if(collab)
          return res.status(200).send({list: collab.list});
        else {
          return res.status(404); 
        }
      });
    });
    
    router.post('/:id/updateData', function (req, res) {
      Collab.findById(req.params.id, function (err, collab) {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        }
        else if (!collab || err || !req.body.list) res.sendStatus(403);
        else {
          collab.list = req.body.list;
          collab.save();
          nsp.in(req.body.roomId).emit('updated');
          res.sendStatus(200);
        }
      });
    });
    
    return router;
  };
module.exports = createCollabRoute;