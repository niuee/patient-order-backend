import { Order } from "../order";

export class Patient {

    private firstName: string;
    private lastName: string;
    private id: string;
    
    constructor(id: string, firstName: string, lastName: string){
        this.firstName = firstName;
        this.lastName = lastName;
        this.id = id;
    }

    getFullName(): string{
        return this.firstName + " " + this.lastName;
    }

    getID(): string{
        return this.id;
    }
    
}