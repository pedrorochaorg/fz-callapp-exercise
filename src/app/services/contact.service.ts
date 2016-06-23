/**
 * Created by pedrorocha on 18/06/16.
 *
 * ContactService
 *
 * Contacts's Backend connection
 *
 */
import { Injectable }    from '@angular/core'; //Angular Core Files
import { Headers, Http } from '@angular/http'; //Angular HTTP Classes/Providers
import { Subject }    from 'rxjs/Subject'; //Subject for use with Observable

import '../rxjs-operators'; // Import RXJS Operators
import { Contact } from '../models/contact'; // Contact data model

@Injectable()
export class ContactService {

    private apiUrl = 'http://localhost:3000/contacts';  // URL to web api

    // Observable to emit events when an Lead is updated
    private updateCallback = new Subject<Contact>();
    updateCallback$ = this.updateCallback.asObservable();

    // Observable to emit events when an Lead is created
    private createCallback = new Subject<Contact>();
    createCallback$ = this.createCallback.asObservable();

    /*
     ContactService constructor
     @param http:Http
     @return classInstance
     */
    constructor(private http: Http) { }


    //Retrieves all the Contact Objects from the API
    getContacts(): Promise<Contact[]> {
        return this.http.get(this.apiUrl)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    //Retrieves a Contact by sending it's ID
    getContact(id: number) {
        return this.getContacts()
            .then(contacts => contacts.filter(contact => contact.id === id)[0]);
    }

    //Retrieves a Contact by sending one of it's associated phone numbers
    getContactByPhone(phone: string) {
        return this.getContacts()
            .then(contacts => contacts.filter(contact => (contact.phones.indexOf(""+phone)!=-1 || contact.phones.indexOf("+"+phone)!=-1) )[0]);
    }

    //Saves a Lead Object in the API
    save(contact: Contact): Promise<Contact>  {
        if (contact.id) {
            return this.put(contact);
        }
        return this.post(contact);
    }

    //Trigger create Observable
    triggerCreate(contact : Contact){
        this.createCallback.next(contact);
    }

    // Add new Contact
    private post(contact: Contact): Promise<Contact> {
        let headers = new Headers({
            'Content-Type': 'application/json'});
        return this.http
            .post(this.apiUrl, JSON.stringify(contact), {headers: headers})
            .toPromise()
            .then(res =>  res.json())
            .catch(this.handleError);
    }

    // Update existing Contact
    private put(contact: Contact) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let url = `${this.apiUrl}/${contact.id}`;
        this.updateCallback.next(contact);
        return this.http
            .put(url, JSON.stringify(contact), {headers: headers})
            .toPromise()
            .then(() => contact)
            .catch(this.handleError);
    }

    //Handle Errors
    private handleError(error: any) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}
