const fs = require('fs')

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
            const file = req.file;
            
            const filename = file.originalname

            await fs.writeFile(`./RawVideos/${filename}`, file.buffer, (err) => 
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
}

module.exports = new ContentController();
