import express from "express";
import { Router } from "express";
import { PatientOrderRepository, PatientOrderRepositoryError } from "../repository";

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

        this.router.post("/patient", async(req, res)=>{
            const body = req.body;
            if (body.lastName == undefined) {
                res.status(400).json({msg: "patient's last name not provided"});
                return;
            }
            if (body.firstName == undefined) {
                res.status(400).json({msg: "patient's first name not provided"});
                return;
            }
            if (body.sex == undefined) {
                res.status(400).json({msg: "patient's sex not provided"});
                return;
            }
            if (body.birthDate == undefined) {
                res.status(400).json({msg: "patient's birth date not provided"});
                return;
            }
            try{
                const birthDate = new Date(body.birthDate + "T00:00:00.000+08:00");
                await this.patientOrderRepository.insertPatient(body.firstName, body.lastName, body.sex, body.birthDate);
                res.status(200).send();
            } catch(e){
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
                if (e instanceof PatientOrderRepositoryError){
                    // e.getCode();
                    res.status(400).json({msg: e.message});
                }
                res.status(500).send();
            }
        });

        this.router.post("/order", async (req, res)=>{
            const body = req.body;
            if (body.message == undefined){
                res.status(400).send({msg: "no order message provided"});
                return;
            }
            const patientId = body.patientId;
            const orderId = body.orderId;
            const message = body.message;
            try{
                if (patientId !== undefined){
                    await this.patientOrderRepository.insertOrderForPatient(patientId, message);
                    res.status(200).send();
                    return;
                }
                if (orderId !== undefined){
                    await this.patientOrderRepository.editOrder(orderId, message);
                    res.status(200).send();
                    return;
                }
                res.status(404).json({msg: 'either provide the patient id to insert new order or the order id to edit existing order'});
            } catch(e){
                res.status(500).send();
                return;
            }
        });

        // this.router.put("/order", async (req, res)=>{
        //     const body = req.body;
        //     if (body.orderId == undefined){
        //         res.status(404).send({msg: "no order id provided"});
        //         return;
        //     }
        //     if (body.message == undefined){
        //         res.status(404).send({msg: "no order message provided"});
        //         return;
        //     }
        //     const orderId = body.orderId;
        //     const message = body.message;
        //     try{
        //         await this.patientOrderRepository.editOrder(orderId, message);
        //         res.status(200).send();
        //     } catch(e){
        //         res.status(500).send();
        //         return;
        //     }
        // });
    }

    async wrapUp(){
        await this.patientOrderRepository.wrapUp();
    }


}