import { PGPatientOrderRepository } from "../src/repository";

const repo = new PGPatientOrderRepository("test_role", "localhost", "patient_order_db", "getwellsoon", 5432);

describe("Postgresql Repository for patient order system", ()=>{
    
    test("Get All Patients", async ()=>{
        const actual = await repo.getPatients();
        const actualOrder = await repo.getOrdersForPatient(actual[0].getID());
        const actualHistory = await repo.getOrderHistory('0');
        await repo.wrapUp();
        console.log(actual);
        console.log(actualOrder);
        console.log(actualHistory);
    });
});