import { PGPatientOrderRepository } from "../src/repository";

const repo = new PGPatientOrderRepository("test_role", "localhost", "patient_order_db", "getwellsoon", 5432);

describe("Postgresql Repository for patient order system", ()=>{
    
    test("Get All Patients", async ()=>{
        
    });
});