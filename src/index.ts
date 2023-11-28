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
const repo = new PGPatientOrderRepository("test_role", "localhost", "patient_order_db", "getwellsoon", 5432);
const queryOnlyRepo = new PGPatientOrderQueryOnlyRepository("test_role", "localhost", "patient_order_db", "getwellsoon", 5432);
const patientOrderController = new PatientOrderRetrievalController(repo, queryOnlyRepo);

app.use(cors({origin: [`localhost:${port}`]}));

app.get('/', (req, res) =>{
    console.log("Got request");
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