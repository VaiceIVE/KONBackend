const express = require('express');
const cors = require('cors');
const {urlencoded} = require('express');
const ContentRouter = require('./Routers/contentRouter')




const PORT = process.env.PORT || 8000;


const app = new express();



//app.use('/video',express.static('./RawVideos/'))
app.use(ContentRouter);





app.listen(PORT, () => {console.log(`Listening ${PORT}`)});