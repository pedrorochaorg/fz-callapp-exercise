/**
 * Created by pedrorocha on 18/06/16.
 *
 * CaseService
 *
 * Case's Backend connection
 *
 */

import { Injectable }    from '@angular/core'; //Angular Core Files
import { Headers, Http } from '@angular/http'; //Angular HTTP Classes/Providers
import { Subject }    from 'rxjs/Subject'; //Subject for use with Observable

import '../rxjs-operators'; // Import RXJS Operators
import { Case } from '../models/case'; // Contact data model

@Injectable()
export class CaseService {

    private apiUrl = 'http://localhost:3000/cases';  // URL to web api

    // Observable to emit events when an Case is updated
    private updateCallback = new Subject<Case>();
    updateCallback$ = this.updateCallback.asObservable();

    // Observable to emit events when an Case is created
    private createCallback = new Subject<Case>();
    createCallback$ = this.createCallback.asObservable();



    /*
     CaseService constructor
     @param http:Http
     @return classInstance
     */
    constructor(private http: Http) {



    }

    //Retrieves all the Case Objects from the API
    getCases(): Promise<Case[]> {
        return this.http.get(this.apiUrl)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    //Retrieves a Case by sending it's ID
    getCase(id: number) {
        return this.getCases()
            .then(cases => cases.filter(_case => _case.id === id)[0]);
    }

    //Retrieves a Case by sending the callId
    getCaseByCallId(id: number){
        return this.getCases()
            .then(cases => cases.filter(_case => _case.callId === id)[0]);
    }

    //Saves a Lead Object in the API
    save(_case: Case): Promise<Case>  {
        if (_case.id) {
            return this.put(_case);
        }
        return this.post(_case);
    }


    //Trigger create Observable
    triggerCreate(_case : Case){
        this.createCallback.next(_case);
    }



    // Add new Case
    private post(_case: Case): Promise<Case> {
        let headers = new Headers({
            'Content-Type': 'application/json'});
        return this.http.post(this.apiUrl, JSON.stringify(_case), {headers: headers})
            .toPromise()
            .then(res =>  res.json())
            .catch(this.handleError);
    }

    // Update existing Case
    private put(_case: Case) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let url = `${this.apiUrl}/${_case.id}`;
        this.updateCallback.next(_case);
        return this.http.put(url, JSON.stringify(_case), {headers: headers})
            .toPromise()
            .then(() =>  _case)
            .catch(this.handleError);
    }


    //Handle Errors
    private handleError(error: any) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }



}
