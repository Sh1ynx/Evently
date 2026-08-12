import { createServer } from 'http';


const server = createServer((req: any, res: any) => {
    if (req.url == "/health" && req.method == "GET"){
        res.writeHead(200, {"Content-Type": "application/json"})
        res.write(JSON.stringify({"message":"I am alive"}))
        res.end()
    }
    else{
        res.writeHead(404, {"Content-Type": "application/json"})
        res.write(JSON.stringify({"message": "Not found"}))
        res.end()
    }
})

server.listen(3000, () => {
    console.log("welcome")
})

