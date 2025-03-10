const http = require('http');
const app = require('./app');
const server = http.Server(app);
const port = process.env.PORT || 4002;






server.listen(port,()=>{
    console.log(`productUpload service running on port ${port} http://localhost:${port}`);
});