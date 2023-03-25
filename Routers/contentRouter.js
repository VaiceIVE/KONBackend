const ContentController = require('../Controllers/contentController')
const Router = require('express');
const router = new Router();
const multer = require('multer')();

router.get('/video/:filename', ContentController.getVideoFragment);
router.get('/oaoa', (req, res) => {console.log('oaoa'); res.json("ok")});
router.post('/save', multer.single('file'), ContentController.saveVideo);



module.exports = router;