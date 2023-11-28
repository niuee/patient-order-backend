import { Order } from "../order";

export class Patient {

    private firstName: string;
    private lastName: string;
    private id: string;
    private sex: Sex;
    private birthDate: Date;
    
    constructor(id: string, firstName: string, lastName: string, sex: Sex, birthDate: Date){
        this.firstName = firstName;
        this.lastName = lastName;
        this.id = id;
        this.sex = sex;
        this.birthDate = birthDate;
    }

    getFullName(): string{
        return this.firstName + " " + this.lastName;
    }

    getFirstName(): string{
        return this.firstName;
    }

    getLastName(): string{
        return this.lastName;
    }

    getID(): string{
        return this.id;
    }

    getBirthDate(): Date {
        return this.birthDate;
    }

    getSex():Sex{
        return this.sex;
    }
    
}

export const enum Sex {
    M=1,
    F
}