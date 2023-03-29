const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')
const datetime = require('node-datetime')
const responseToReadable = response => {
    const reader = response.body.getReader();
    const rs = new Readable();
    rs._read = async () => {
        const result = await reader.read();
        if(!result.done){
            rs.push(Buffer.from(result.value));
        }else{
            rs.push(null);
            return;
        }
    };
    return rs;
};

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
    getAudioFragment(req, res) {
        console.log("Startin")      
        
        const filename = req.params.filename;

        console.log(filename)

        const filePath = './ProcessedAudio/' + filename + '.mp3'

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
                    'Content-Type': 'audio/mp3'
            }
            res.writeHead(206, head);
            file.pipe(res);
        }
        else{
            const head = {
                'Content-Length': filesize,
                'Content-Type': 'audio/mp3'
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
            var data
            await fs.writeFile(`./RawVideos/${filename}`, file.data, (err) => 
            {
                if(err)
                {
                    console.log(err)
                    res.status(500).send("Ошибка сохранения файла")
                }
                else
                {
                    let form = new FormData();
                    form.append('file', file.data, filename)
                    axios.post('http://localhost:8000/mp4', form,{ responseType: "stream" }, {
                        headers:
                        {
                            'Content-Type': 'video/mp4'
                            
                        }
                    }).then((responsefromserver) =>{
                        return new Promise((resolve, reject) => {
                            const writer = fs.createWriteStream(`./ProcessedAudio/${filename.replace('mp4', 'mp3')}`)
                            responsefromserver.data.pipe(writer);
                            let error = null;
                            writer.on('error', err => {
                            error = err;
                            writer.close();
                            reject(err);
                            });
                            writer.on('close', () => {
                            if (!error) {
                                resolve(true);
                            }
                            });
                        });
                        }
                    ).catch((err) =>{
                        console.log(err)
                    })
                    res.status(200).send("Сохранено успешно")
                }
            })
        }
    async getCommented(req, res)
    {
        axios.get('http://localhost:8000/tiflovideo').then((responsefromserver) => {
            //console.log(responsefromserver)
            res.json(responsefromserver.data)
        })
    }
    async getProcessedFiles(req, res)
    {
        var reslist = []


        fs.readdirSync('./ProcessedAudio/').forEach(file => {
            reslist.push(file)
        });
        console.log(reslist)
        var realreslist=[]

        reslist.map(x => realreslist.push(JSON.parse(`{"name": ${String('"' + x.replace('.mp3', '') + '"')}, "vidurl": ${'"' + 'http://91.185.86.61:8080/video/' + String(x.replace('.mp3', '.mp4')) + '"'}, "audurl": ${'"http://91.185.86.61:8080/audio/' + String(x.replace('.mp3', '.mp3')) + '"'}}`)))

        res.json(realreslist)
    }
    processFeedback(req, res)
    {
        console.log(req.body.message)
        fs.writeFile(`./Feedback/${String(Date.now())}.txt`, req.body.message, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
            res.status(200).send("ok")
        }); 
    }
}

module.exports = new ContentController();
