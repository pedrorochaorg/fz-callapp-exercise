/**
 * Created by pedrorocha on 18/06/16.
 *
 *  AppComponent
 *
 *  App Main Component
 */
import { Component , enableProdMode, OnInit}  from '@angular/core'; //Angular Core Files
enableProdMode();

import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from '@angular/router-deprecated'; //Angular Routing Files
import { CallHistoryComponent } from './call-history/call-history.component'; //CallHistoryComponent component to list all calls
import { CallService } from './services/call.service'; //CallService service responsible for managing calls
import { ContactService } from './services/contact.service'; //ContactService service responsible for managing contacts
import { LeadService } from './services/lead.service'; //LeadService service responsible for managing leads
import { CaseService } from './services/case.service'; //CaseService service responsible for managing cases
import { Call } from './models/call' //Call data model
import { Contact } from './models/contact' //Contact data model
import { Case } from './models/case' //Case data model
import { Lead } from './models/lead' //Lead data model


@Component({
    selector: 'my-app',
    templateUrl: 'app/app.component.html',
    directives: [ROUTER_DIRECTIVES],
    providers: [
        ROUTER_PROVIDERS,
        CallService,
        ContactService,
        LeadService,
        CaseService
    ]
})
@RouteConfig([
    { path: '/recent',  name: 'Call History',  component: CallHistoryComponent, useAsDefault: true, }
])

export class AppComponent implements OnInit {
    title = 'Tour of Heroes';
    totalData = 2;
    numbers:string[] = [];

    contacts:Contact[];
    leads:Lead[];

    error: any;

    constructor(private callService:CallService, private contactService:ContactService, private caseService:CaseService, private leadService:LeadService){

    }


    /*
      This function is intended search for a Contact[] related with the provided phone number
      @param phone:String
      @return Contact | null;
     */

    private _getContactByPhone(phone:string):Contact {
        for(var i = 0; i < this.contacts.length; i++){
            if(this.contacts[i].phones.indexOf(""+phone)!=-1 || this.contacts[i].phones.indexOf("+"+phone)!=-1){
                console.log("-> AppComponent :: _getContactByPhone -> ", this.contacts[i]);

                return this.contacts[i];
            }
        }
        return null;
    }

    /*
     This function is intended search for a Lead[] related with the provided phone number
     @param phone:String
     @return Lead | null;
     */

    private _getLeadByPhone(phone:string):Lead {
        for(var i = 0; i < this.leads.length; i++){
            if(this.leads[i].phones.indexOf(""+phone)!=-1 || this.leads[i].phones.indexOf("+"+phone)!=-1){
                console.log("-> AppComponent :: _getLeadByPhone -> ", this.leads[i]);


                return this.leads[i];
            }
        }
        return null;
    }


    /*
     This function listen's for car Creation events
     @param call:Call

     */

    callReceived(call : Call){
        // Add timeout to a new call to check if it get's answeared in 2 minutes
        setTimeout(() => {
            if(call.state==='RING'){
                call.state = 'MISSED';
                this.callService.save(call);
            }
        },120000);

        // Set vars
        let c = new Case(), _c: Contact , _l :Lead;


        // Fill in Case details
        c.callId = call.id;
        c.status = '';
        c.description = '';


        //get contact by phone number
        _c = this._getContactByPhone(""+call.number);
        //get lead by phone number
        _l = this._getLeadByPhone(""+call.number);


        if(_c){
            c.contactId = _c.id;
        }
        else if(_l){
            c.leadId = _l.id;
        }
        _c = null;
        _l = null;


        // Debug Log
        console.log("-> AppComponent :: callReceived -> ",call,c);


        this.caseService.save(c).then(_case => {

            // Debug Log
            console.log("-> AppComponent :: caseSaved -> ",_case);

            // Trigger Create Observable to emit the newlly Created case to allow it's propagation through all the components
            this.caseService.triggerCreate(_case);
        });

    }



    /*
     This function starts the Call Emmitter Service

     */

    setupEnded(){
        // Decrement totalData var to know if all request's ended
        this.totalData--;

        if(this.totalData<=0){

            // Add Call back to listen for new calls
            this.callService.createCallback$.subscribe( call => this.callReceived(call));

            // Set Numbers to simulate calls
            this.callService.setCallList(this.numbers);

            // Start Call Service ( Call Simulation )
            this.callService.startCallService();

        }
    }

    /*
     This function setup's the Call Service provider

     */
    setupCallService(){

        // ContactService -> get all contact data

        this.contactService.getContacts().then(contacts => {
            this.contacts = contacts;
            for(var i=0; i<contacts.length; i++){
                for( var a = 0; a < contacts[i].phones.length ; a++ ) {
                    this.numbers.push(""+contacts[i].phones[a]);
                }
            }
            this.setupEnded();
        }).catch(error => this.handleError(error));

        // LeadService -> get all lead data

        this.leadService.getLeads().then(leads => {
            this.leads = leads;

            for(var i=0; i<leads.length; i++){
                for( var a = 0; a < leads[i].phones.length ; a++ ) {
                    this.numbers.push(""+leads[i].phones[a]);
                }
            }
            this.setupEnded();
        }).catch(error =>  this.handleError(error));


    }

    /*
     This function handles promisses errors
     */

    handleError( error : any) {
        this.error = error;
        console.log("Error -> ", error);
    }

    ngOnInit(){

        // Init App
        this.setupCallService();
    }


}
