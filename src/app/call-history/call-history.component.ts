/**
 * Created by pedrorocha on 18/06/16.
 */
import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router-deprecated';

import { CallService } from '../services/call.service';
import { ContactService } from '../services/contact.service';
import { LeadService } from '../services/lead.service';
import { CaseService } from '../services/case.service';

import { CallEntryComponent } from '../call-entry/call-entry.component';

import { Call }                from '../models/call';
import { Lead }                from '../models/lead';
import { Contact }                from '../models/contact';
import { Case }                from '../models/case';

import { OrderByPipe } from '../pipes/orderby.pipe';



@Component({
    selector: 'call-history',
    templateUrl: 'app/call-history/call-history.component.html',
    directives: [CallEntryComponent],
    pipes: [ OrderByPipe ]
})


export class CallHistoryComponent implements OnInit {

    calls: Call[] = [];
    leads: Lead[] = [];
    cases: Case[] = [];
    contacts: Contact[] = [];
    error: any;
    count:number = 3;

    constructor(private router: Router,private callService: CallService,private caseService: CaseService, private contactService: ContactService, private leadService:LeadService) {

    }

    getCalls(){
        this.caseService
            .getCases()
            .then(cases => {this.cases = cases;  this.matchCases(); })
            .catch(error => this.error = error);

        this.contactService
            .getContacts()
            .then(contacts => {this.contacts = contacts;  this.matchCases(); })
            .catch(error => this.error = error);


        this.leadService
            .getLeads()
            .then(leads => {this.leads = leads;  this.matchCases(); })
            .catch(error => this.error = error);




    }


    matchCases(){
        this.count--;
        if(this.count<=0) {
            this.callService
                .getCalls()
                .then(calls => {
                    this.calls = calls;
                })
                .catch(error => this.error = error);
        }
    }

    ngOnInit() {

        this.caseService.createCallback$.subscribe( _case => {

            this.cases.push(_case);
        });

        this.caseService.updateCallback$.subscribe( _case => {
                this.cases.forEach( (c:Case, index:number) => {
                    if(_case.id===c.id)
                        this.cases[index] = c;
                });
        });


        this.leadService.createCallback$.subscribe( lead => {

            this.leads.push(lead);
        });

        this.leadService.updateCallback$.subscribe( lead => {
            this.leads.forEach( (c:Lead, index:number) => {
                if(lead.id===c.id)
                    this.leads[index] = c;
            });
        });

        this.contactService.createCallback$.subscribe( contact => {

            this.contacts.push(contact);
        });

        this.contactService.updateCallback$.subscribe( contact => {
            this.contacts.forEach( (c:Contact, index:number) => {
                if(contact.id===c.id)
                    this.contacts[index] = c;
            });
        });



        this.getCalls();
        this.callService.createCallback$.subscribe( call => this.callReceived(call));

        this.callService.updateCallback$.subscribe( call => {
            this.calls.forEach( (c:Call, index:number) => {
                if(call.id===c.id)
                    this.calls[index] = c;
            });
        });
    }

    callReceived(call : Call){

        console.log("-> CallHistory :: casllreceived -> ",call);

        this.calls.push(call);


        this.calls = new OrderByPipe().transform(this.calls,['!id']);
        console.log(this.calls);
    }


    onUpdate(call : Call){

        this.callService.save(call).then(call => {

            var index  = this.getCallIndexById(call.id);
            this.calls[index] = call;
        });


    }

    hangCalls(call : Call){
        for(var i = 0; i< this.calls.length; i++){
            if(this.calls[i].state=='ACTIVE' && this.calls[i].id!=call.id){
                if(this.calls[i].durationMs)
                    this.calls[i].durationMs = this.calls[i].durationMs + ( new Date().getTime() - this.calls[i].timestamp );
                else
                    this.calls[i].durationMs = new Date().getTime() - this.calls[i].timestamp;
                this.calls[i].state = 'HOLD';
            }
        }
    }

    getCallIndexById(id: number){
        for(var i  = 0; i < this.calls.length; i++){
            if(this.calls[i].id === id)
                return i;
        }
        return -1;
    }

    getContactByPhone(phone:string):Contact {
        for(var i = 0; i < this.contacts.length; i++){

            if(this.contacts[i].phones.indexOf(""+phone)!=-1 || this.contacts[i].phones.indexOf("+"+phone)!=-1){
                //console.log("-> CallHistory :: _getContactByPhone -> ", this.contacts[i]);
                return this.contacts[i];
            }
        }
        return null;
    }

    getLeadByPhone(phone:string):Lead {
        for(var i = 0; i < this.leads.length; i++){

            if(this.leads[i].phones.indexOf(""+phone)!=-1 || this.leads[i].phones.indexOf("+"+phone)!=-1){

                return this.leads[i];
            }
        }
        return null;
    }

    getCaseByCallId(id:number):Case {
        for(var i = 0; i < this.cases.length; i++){
            if(this.cases[i].callId==id){
                return this.cases[i];
            }
        }
        return null;
    }


}
