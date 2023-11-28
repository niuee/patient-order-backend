import { Patient } from "../patient";
import { Order } from "../order";

export interface PatientOrderRepository {
    getPatients(): Promise<Patient[]>;
    getPatient(patientId: string): Promise<Patient | undefined>;
    getOrdersForPatient(patientId: string): Promise<Order[]>;
    getOrderHistory(orderId: string): Promise<{message: string, entryDate: Date}[]>;
    insertOrderForPatient(patientId: string, message: string): Promise<void>;
    insertPatient(firstName: string, lastName: string, sex: string, birthDate: Date): Promise<void>;
    editOrder(orderId: string, message: string): Promise<void>;
    wrapUp(): Promise<void>;
}

export interface PatientOrderQueryOnlyRepository {
    getPatients(): Promise<PatientForUI[]>;
    getPatient(patientId: string): Promise<PatientForUI | undefined>;
    getOrdersForPatient(patientId: string): Promise<OrderForUI[]>;
    getOrderHistory(orderId: string): Promise<OrderHistoryForUI | undefined>; 
    wrapUp(): Promise<void>;
}


export type PatientForUI = {
    id: string;
    lastName: string;
    firstName: string;
    sex: string;
    birthDate: Date;
}

export type OrderForUI = {
    id: string;
    message: string;
    hasBeenEdited: boolean;
    lastEditDate: Date;
}

export type OrderHistoryForUI = {
    id: string;
    pastEdits: OrderEditsForUI[];
}

export type OrderEditsForUI = {
    id: string;
    entryDate: Date;
    content: string;
}