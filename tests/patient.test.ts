import { Patient } from "../src/patient";

describe("Basic operation on patient object", ()=>{
    test("Get full name of the patient", ()=>{
        const actualPatient = new Patient("test", "John", "Smith");
        expect(actualPatient.getFullName()).toBe("John Smith");
    });
})