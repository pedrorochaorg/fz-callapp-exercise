/**
 * Created by pedrorocha on 18/06/16.
 *
 * LeadService
 *
 * Lead's Backend connection
 *
 */
import { Injectable }    from '@angular/core';  //Angular Core Files
import { Headers, Http } from '@angular/http'; //Angular HTTP Classes/Providers
import { Subject }    from 'rxjs/Subject'; //Subject for use with Observable
import '../rxjs-operators'; // Import RXJS Operators
import { Lead } from '../models/lead'; // Lead data model

@Injectable()
export class LeadService {
    private apiUrl = 'http://localhost:3000/leads';  // URL to web api


    // Observable to emit events when an Lead is updated
    private updateCallback = new Subject<Lead>();
    updateCallback$ = this.updateCallback.asObservable();

    // Observable to emit events when an Lead is created
    private createCallback = new Subject<Lead>();
    createCallback$ = this.createCallback.asObservable();



    /*
        LeadService constructor
        @param http:Http
        @return classInstance
     */
    constructor(private http: Http) { }

    //Retrieves all the Lead Objects from the API
    getLeads(): Promise<Lead[]> {
        return this.http.get(this.apiUrl)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    //Retrieves a Lead by sending it's ID
    getLead(id: number) {
        return this.getLeads()
            .then(leads => leads.filter(lead => lead.id === id)[0]);
    }

    //Retrieves a Lead by sending one of it's associated phone numbers
    getLeadByPhone(phone: string) {
        return this.getLeads()
            .then(leads => leads.filter(lead => (lead.phones.indexOf(""+phone)!=-1 || lead.phones.indexOf("+"+phone)!=-1) )[0]);
    }

    //Saves a Lead Object in the API
    save(lead: Lead): Promise<Lead>  {
        if (lead.id) {
            return this.put(lead);
        }
        return this.post(lead);
    }

    //Trigger create Observable
    triggerCreate(lead : Lead){
        this.createCallback.next(lead);
    }


    // Add new Lead
    private post(lead: Lead): Promise<Lead> {
        let headers = new Headers({
            'Content-Type': 'application/json'});
        return this.http
            .post(this.apiUrl, JSON.stringify(lead), {headers: headers})
            .toPromise()
            .then(res => res.json())
            .catch(this.handleError);
    }

    // Update existing Lead
    private put(lead: Lead) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let url = `${this.apiUrl}/${lead.id}`;
        this.updateCallback.next(lead);
        return this.http
            .put(url, JSON.stringify(lead), {headers: headers})
            .toPromise()
            .then(() =>  lead)
            .catch(this.handleError);
    }

    //Handle Errors
    private handleError(error: any) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}
