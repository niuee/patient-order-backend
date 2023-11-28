import { Order } from "../../order";
import { Patient } from "../../patient";
import { PatientOrderRepository } from "../repository";
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
            const queryResult = await this.dbPool.query(`SELECT * FROM public.patients`);
            const queriedRow = queryResult.rows;
            queriedRow.forEach((row)=>{
                res.push(new Patient(row.id, row['first_name'], row['last_name']));
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
                throw new PatientOrderRepositoryError("order id does not correspond to an existing order", "1110");
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
            const queryResult = await this.dbPool.query(`SELECT * FROM public.patients WHERE id=($1)`, [patientId]);
            await client.query('COMMIT');
            if (queryResult.rowCount == 0){
                return res;
            }
            const queriedRow = queryResult.rows[0];
            res = new Patient(queriedRow.id, queriedRow["first_name"], queriedRow["last_name"]);
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