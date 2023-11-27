import express from "express";
import { Router } from "express";
import { PatientOrderRepository } from "../repository";

export class PatientOrderRetrievalController{
    
    private patientOrderRepository: PatientOrderRepository;
    private router: Router;

    constructor(patientOrderRepository: PatientOrderRepository){
        this.router = express.Router();
        this.patientOrderRepository = patientOrderRepository;
        this.setUpRouter();
    }

    getRouter(): Router{
        return this.router;
    }

    setUpRouter(){
        this.router.use(express.json());

        this.router.get("/patient/:id", async (req, res)=>{
            const patientId = req.params.id;
            try{
                const patient = await this.patientOrderRepository.getPatient(patientId);
                if (patient == undefined){
                    res.status(404).send({msg: `patient with patient id ${patientId} not found`});
                } else {
                    res.status(200).json(patient);
                }
            } catch (e){
                res.status(500).send();
            }
        });

        this.router.get("/patientOrders/:patientId", async (req, res)=>{
            const patientId = req.params.patientId;
            try{
                const patient = await this.patientOrderRepository.getPatient(patientId);
                if (patient == undefined){
                    res.status(404).send({msg: `patient with patient id ${patientId} not found`});
                } else {
                    const orders = await this.patientOrderRepository.getOrdersForPatient(patientId);
                    res.status(200).json(orders);
                }
            } catch(e){
                res.status(500).send();
            }
        });

        this.router.post("/order", async (req, res)=>{
            const body = req.body;
            if (body.patientId == undefined){
                res.status(404).send({msg: "no patient id provided"});
                return;
            }
            if (body.message == undefined){
                res.status(404).send({msg: "no order message provided"});
                return;
            }
            const patientId = body.patientId;
            const message = body.message;
            try{
                await this.patientOrderRepository.insertOrderForPatient(patientId, message);
                res.status(200).send();
            } catch(e){
                res.status(500).send();
                return;
            }
        });

        this.router.put("/order", async (req, res)=>{
            const body = req.body;
            if (body.orderId == undefined){
                res.status(404).send({msg: "no order id provided"});
                return;
            }
            if (body.message == undefined){
                res.status(404).send({msg: "no order message provided"});
                return;
            }
            const orderId = body.orderId;
            const message = body.message;
            try{
                await this.patientOrderRepository.editOrder(orderId, message);
                res.status(200).send();
            } catch(e){
                res.status(500).send();
                return;
            }
        });
    }

    async wrapUp(){
        await this.patientOrderRepository.wrapUp();
    }


}