import { Patient, Sex } from "../patient";
import { Order } from "../order";

export interface PatientOrderRepository{
    getPatients(): Promise<Patient[]>;
    getPatient(patientId: string): Promise<Patient>;
    getOrdersForPatient(patientId: string): Promise<Order[]>;
    getOrderHistory(orderId: string): Promise<{message: string, entryDate: Date}[]>;
    insertOrderForPatient(patientId: string, message: string): Promise<void>;
    insertPatient(firstName: string, lastName: string, sex: string, birthDate: Date): Promise<void>;
    editOrder(orderId: string, message: string): Promise<void>;
    wrapUp(): Promise<void>;
}
