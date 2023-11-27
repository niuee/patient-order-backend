export class Order {

    private message: string;
    private entryDate: Date;
    private id: string;

    constructor(id: string, message: string, entryDate: Date){
        this.id = id;
        this.message = message;
        this.entryDate = entryDate;
    }

    getID(): string {
        return this.id;
    }

    getEntryDate(): Date{
        return this.entryDate;
    }

    getMessage(): string{
        return this.message;
    }
}