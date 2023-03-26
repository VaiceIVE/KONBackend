const fs = require('fs')
const axios = require('axios')
class ContentController{
    getVideoFragment(req, res) {
        console.log("Startin")      
        
        const filename = req.params.filename;

        console.log(filename)

        const filePath = './RawVideos/' + filename + '.mp4'
    
        const stat = fs.statSync(filePath);
        const filesize = stat.size;
        const range = req.headers.range;

        console.log(filesize, range)
    
        if(range)
        {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
    
            const end = parts[1] ? parseInt(parts[1], 10) : filesize - 1;
    
            const chunksize = end - start + 1;
    
            const file = fs.createReadStream(filePath, {start, end})
    
            const head = {
                    'Content-Range' : `bytes${start} - ${end} / ${filesize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': 'video/mp4'
            }
            res.writeHead(206, head);
            file.pipe(res);
        }
        else{
            const head = {
                'Content-Length': filesize,
                'Content-Type': 'video/mp4'
        }
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
        }
}
    async saveVideo(req, res)
        {
            const file = req.files.file;
            const filename = req.body.filename;
            console.log(filename)

            await fs.writeFile(`./RawVideos/${filename}`, file.data, (err) => 
            {
                if(err)
                {
                    console.log(err)
                    res.status(500).send("Ошибка сохранения файла")
                }
                else
                {
                    res.status(200).send("Сохранено успешно")
                }
            })
        }
    async getCommented(req, res)
    {
        axios.get('http://localhost:8000/tiflovideo').then((responsefromserver) => {
            console.log(responsefromserver)
            res.json(responsefromserver.data)
        })
    }
}

module.exports = new ContentController();
