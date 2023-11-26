// import * as express from "express";
import express from "express";
import path from "path";
import fs from "fs/promises";

require('dotenv').config();
let serverPort = process.argv[2];
// console.log("PORT:", serverPort);


const app = express();

// Serve the static files from the React app
app.get('/', (req,res) =>{
    console.log("Got request");
    res.status(200);
    res.send();
});

app.get('/builder', (req,res) =>{
    // console.log("Builder request");
    res.sendFile(path.join(path.resolve(__dirname, ".."), '/index.html'));
});

const port = serverPort || process.env.PORT || 5000;
app.listen(port);

console.log('App is listening on port ' + port);