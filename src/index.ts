// import * as express from "express";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs/promises";
import { PatientOrderRetrievalController } from "./router";
import { PGPatientOrderRepository, PGPatientOrderQueryOnlyRepository } from "./repository";

require('dotenv').config();
let serverPort = process.argv[3];

const app = express();
const port = serverPort || process.env.PORT || 5000;
const repo = new PGPatientOrderRepository("test_role", "192.168.1.5", "patient_order_db", "getwellsoon", 5432);
const queryOnlyRepo = new PGPatientOrderQueryOnlyRepository("test_role", "192.168.1.5", "patient_order_db", "getwellsoon", 5432);
const patientOrderController = new PatientOrderRetrievalController(repo, queryOnlyRepo);

let allowedOrigins = ['http://localhost:8081', 'http://localhost:5502', 'https://vntchang.dev'];
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.get('/', (req, res) =>{
    res.status(200);
    res.send();
});

app.use("/api", patientOrderController.getRouter());



const server = app.listen(port);
console.log('App is listening on port ' + port);


process.on("SIGINT", () => {
    console.log("Arrest Signal");
    server.close();
    patientOrderController.wrapUp().finally(()=>{
        console.log("wrapped up closing process");
        process.exit(0)
    });
});