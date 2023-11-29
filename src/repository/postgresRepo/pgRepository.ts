import { Order } from "../../order";
import { Patient, Sex } from "../../patient";
import { PatientOrderRepository, PatientOrderQueryOnlyRepository, PatientForUI, OrderForUI, OrderHistoryForUI } from "../repository";
import { Pool } from "pg";

export class PGPatientOrderRepository implements PatientOrderRepository{

    private dbPool: Pool;

    constructor(dbUser: string, dbHost: string, dbDatabase: string, dbPassword: string, dbPort: number){
        this.dbPool = new Pool({
            user: dbUser,
            host: dbHost,
            database: dbDatabase,
            password: dbPassword,
            port: dbPort,
            max: 20
        });
    }
    
    async getPatients(): Promise<Patient[]> {
        const res: Patient[] = [];
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            const queryResult = await client.query(`SELECT * FROM public.patients`);
            const queriedRow = queryResult.rows;
            queriedRow.forEach((row)=>{
                res.push(new Patient(row.id, row['first_name'], row['last_name'], row['sex'] == 'M' ? Sex.M : Sex.F, row['birth_date']));
            })
            await client.query('COMMIT');
        } catch(e){
            await client.query('ROLLBACK');
            throw e;
        } finally{
            client.release();
            return res;
        }
    }

    async getOrdersForPatient(patientId: string): Promise<Order[]> {
        const res: Order[] = [];
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            const queryResult = await client.query('SELECT id FROM public.orders WHERE patient_id=($1)', [patientId]);
            const queriedRow = queryResult.rows;
            queriedRow.forEach(async (row)=>{
                const orderQuery = await client.query('SELECT content, entry_date FROM public.messages WHERE order_id=($1) ORDER BY entry_date DESC LIMIT 1', [row.id]);
                if (orderQuery.rowCount >= 1){
                    const specificOrder = orderQuery.rows[0];
                    res.push(new Order(row.id, specificOrder.content, specificOrder['entry_date']));
                }
            });
            await client.query('COMMIT');
        } catch(e){
            await client.query('ROLLBACK');
            throw e;
        } finally{
            client.release();
            return res;
        }
    }

    async getOrderHistory(orderId: string): Promise<{message: string, entryDate: Date}[]>{
        const res: {message: string, entryDate: Date}[] = [];
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            const queryResult = await client.query('SELECT content, entry_date FROM public.messages WHERE order_id=($1) ORDER BY entry_date DESC', [orderId]);
            const queriedRow = queryResult.rows;
            queriedRow.forEach(async (row)=>{
                res.push({message: row.content, entryDate: row['entry_date']});
            });
            await client.query('COMMIT');
        } catch(e){
            await client.query('ROLLBACK');
            throw e;
        } finally{
            client.release();
            return res;
        }
    }

    async insertOrderForPatient(patientId: string, message: string): Promise<void> {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            await client.query('INSERT INTO public.orders (patient_id) VALUES ($1)', [patientId]);
            const queryRes = await client.query('SELECT last_value FROM orders_id_seq');
            const orderId = queryRes.rows[0]['last_value'];
            await client.query('INSERT INTO public.messages (content, order_id, entry_date) VALUES ($1, $2, $3)', [message, orderId, new Date()]);
            await client.query('COMMIT');
        } catch(e){
            await client.query('ROLLBACK');
            // console.log(e);
            // console.log(e instanceof Error);
            // console.log(e.detail);
            if (e.code == '22P02'){
                throw new PatientOrderRepositoryError("patient id invalid", "1121");
            }
            if (e.code == '23503'){
                throw new PatientOrderRepositoryError("patient with the patient id does not exist", "1120");
            }
            throw e;
        } finally{
            client.release();
        }
    }

    async editOrder(orderId: string, message: string): Promise<void> {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            await client.query('INSERT INTO public.messages (content, order_id, entry_date) VALUES ($1, $2, $3)', [message, orderId, new Date()]);
            await client.query('COMMIT');
        } catch(e){
            await client.query('ROLLBACK');
            if (e.code == '23503'){
                throw new PatientOrderRepositoryError(`order with order id ${orderId} does not exist`, "1110");
            }
            // console.log(e);
            // console.log(e instanceof Error);
            // console.log(e.detail);
            throw e;
        } finally{
            client.release();
        }
    }

    async getPatient(patientId: string): Promise<Patient | undefined>{
        let res: Patient = undefined;
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            const queryResult = await client.query(`SELECT * FROM public.patients WHERE id=($1)`, [patientId]);
            await client.query('COMMIT');
            if (queryResult.rowCount == 0){
                return res;
            }
            const queriedRow = queryResult.rows[0];
            res = new Patient(queriedRow.id, queriedRow["first_name"], queriedRow["last_name"], queriedRow['sex'] == "M" ? Sex.M : Sex.F, queriedRow['birth_date']);
        } catch(e){
            await client.query('ROLLBACK');
            if (e.code == '22P02'){
                throw new PatientOrderRepositoryError("patient id invalid", "1121");
            }
            throw e;
        } finally{
            client.release();
            return res;
        }
    }

    async insertPatient(firstName: string, lastName: string, sex: string, birthDate: Date){
        const client = await this.dbPool.connect();
        sex = sex.toLowerCase();
        if (sex == "m" || sex == "male"){
            sex = "M";
        } else if (sex == "f" || sex == "female"){
            sex = "F";
        }
        try {
            await client.query('BEGIN');
            await client.query(`INSERT INTO patients (last_name, first_name, sex, birth_date) VALUES($1, $2, $3, $4)`, [lastName, firstName, sex, birthDate]);
            await client.query('COMMIT');
        } catch(e){
            await client.query('ROLLBACK');
            throw e;
        } finally{
            client.release();
        }
    }

    async wrapUp(){
        await this.closePool();
    }

    async closePool(){
        await this.dbPool.end();
    }

}

export class PGPatientOrderQueryOnlyRepository implements PatientOrderQueryOnlyRepository {

    private dbPool: Pool;

    constructor(dbUser: string, dbHost: string, dbDatabase: string, dbPassword: string, dbPort: number){
        this.dbPool = new Pool({
            user: dbUser,
            host: dbHost,
            database: dbDatabase,
            password: dbPassword,
            port: dbPort,
            max: 5
        });
    }

    async getPatients(): Promise<PatientForUI[]> {
        const res: PatientForUI[] = [];
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            const queryResult = await client.query(`SELECT * FROM public.patients`);
            const queriedRow = queryResult.rows;
            queriedRow.forEach((row)=>{
                res.push({
                    id: row.id,
                    lastName: row['last_name'],
                    firstName: row['first_name'],
                    sex: row['sex'],
                    birthDate: row['birth_date']
                });
            })
            await client.query('COMMIT');
        } catch(e){
            await client.query('ROLLBACK');
            throw e;
        } finally{
            client.release();
            return res;
        }
    }

    async getPatient(patientId: string): Promise<PatientForUI | undefined>{
        let res: PatientForUI = undefined;
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            const queryResult = await client.query(`SELECT * FROM public.patients WHERE id=($1)`, [patientId]);
            await client.query('COMMIT');
            if (queryResult.rowCount == 0){
                return res;
            }
            const queriedRow = queryResult.rows[0];
            res = {
                id: queriedRow.id,
                lastName: queriedRow['last_name'],
                firstName: queriedRow['first_name'],
                sex: queriedRow['sex'],
                birthDate: queriedRow['birth_date']
            };
        } catch(e){
            await client.query('ROLLBACK');
            if (e.code == '22P02'){
                throw new PatientOrderRepositoryError("patient id invalid", "1121");
            }
            throw e;
        } finally{
            client.release();
            return res;
        }
    }

    async getOrdersForPatient(patientId: string): Promise<OrderForUI[]> {
        const res: OrderForUI[] = [];
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            const queryResult = await client.query('SELECT id FROM public.orders WHERE patient_id=($1)', [patientId]);
            const queriedRow = queryResult.rows;
            for(const row of queriedRow){
                const editCounts = await client.query('SELECT COUNT(*) FROM public.messages WHERE order_id=($1)', [row.id]);
                const orderQuery = await client.query('SELECT content, entry_date FROM public.messages WHERE order_id=($1) ORDER BY entry_date DESC LIMIT 1', [row.id]);
                if (orderQuery.rowCount >= 1){
                    const specificOrder = orderQuery.rows[0];
                    // console.log(specificOrder);
                    res.push(
                    {
                        id: row.id, 
                        message: specificOrder.content, 
                        lastEditDate: specificOrder['entry_date'],
                        hasBeenEdited: (+editCounts.rows[0].count) > 1
                    });
                }
            }
            await client.query('COMMIT');
        } catch(e){
            await client.query('ROLLBACK');
            throw e;
        } finally{
            client.release();
            // console.log("res", res);
            return res;
        }
    }

    async getOrderHistory(orderId: string): Promise<OrderHistoryForUI>{
        const res: OrderHistoryForUI = {
            id: orderId,
            pastEdits: [],
        };
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            const checkOrderExist = await client.query('SELECT COUNT(*) FROM public.orders WHERE id=($1)', [orderId]);
            if (checkOrderExist.rowCount == 0){
                throw new PatientOrderRepositoryError(`order with order id ${orderId} does not exist`, "1110");
            } 
            const queryResult = await client.query('SELECT id, content, entry_date FROM public.messages WHERE order_id=($1) ORDER BY entry_date DESC', [orderId]);
            const queriedRow = queryResult.rows;
            queriedRow.forEach((row)=>{
                res.pastEdits.push({id: row.id, content: row.content, entryDate: row['entry_date']});
            });
            await client.query('COMMIT');
        } catch(e){
            await client.query('ROLLBACK');
            throw e;
        } finally{
            client.release();
            return res;
        }
    }

    async wrapUp(){
        await this.closePool();
    }

    async closePool(){
        await this.dbPool.end();
    }


}


export class PatientOrderRepositoryError extends Error {

    private code: string;

    constructor(message: string, code: string){
        super(message);
        this.code = code;
    }

    getCode(): string{
        return this.code;
    }
}