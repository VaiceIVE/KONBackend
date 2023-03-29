const ContentController = require('../Controllers/contentController')
const Router = require('express');
const router = new Router();
const multer = require('multer')();

//router.get('/video/:filename', ContentController.getVideoFragment);
//router.get('/audio/:filename', ContentController.getAudioFragment);
router.get('/oaoa', (req, res) => {console.log('oaoa'); res.json("ok")});
router.post('/save', ContentController.saveVideo);
router.get('/tiflocommented', ContentController.getCommented)
router.get('/getprocessed', ContentController.getProcessedFiles)
router.post('/feedback', ContentController.processFeedback);





module.exports = router;