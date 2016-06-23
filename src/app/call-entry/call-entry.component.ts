/**
 * Created by pedrorocha on 18/06/16.
 */

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router }            from '@angular/router-deprecated';

import { CallService } from '../services/call.service';
import { CaseService } from '../services/case.service';
import { ContactService } from '../services/contact.service';
import { LeadService } from '../services/lead.service';

import { Call }                from '../models/call';
import { Case }                from '../models/case';
import { Contact }                from '../models/contact';
import { Lead }                from '../models/lead';



@Component({
    selector: 'call-entry',
    templateUrl: 'app/call-entry/call-entry.component.html',
    styleUrls: ['app/call-entry/call-entry.css']
})



export class CallEntryComponent implements OnInit {

    @Input() callData: Call;
    @Input() contact: Contact;
    @Input() lead: Lead;
    @Input() _case: Case;

    @Output() update = new EventEmitter();
    @Output() hangCalls = new EventEmitter();

    isDetailOpen : boolean = false;

    error: any;

    constructor(private router: Router,private callService: CallService,private caseService: CaseService,private contactService: ContactService,private leadService: LeadService) {

    }

    ngOnInit() {
        if(!this._case)
            this.caseService.getCaseByCallId(this.callData.id).then(cc => this._case = cc);

        if(!this.contact)
            this.contactService.getContactByPhone(""+this.callData.number).then(contact => this.contact = contact);

        if(!this.lead && !this.contact)
            this.leadService.getLeadByPhone(""+this.callData.number).then(lead => this.lead = lead);

        console.log(this.contact, this.lead);

        if(this.callData.state==='RING'  && (new Date().getTime() - this.callData.timestamp) > 120000)
        {
            this.callData.state = 'MISSED';
            this.callService.save(this.callData);

        }
        else if(this.callData.state === 'RING'){
            setTimeout(() => {
                this.callData.state = 'MISSED';
                this.callService.save(this.callData);
            },120000);
        }

    }
    toggleDetails(){
        this.isDetailOpen = !this.isDetailOpen;
    }

    holdCall(){
        this.callData.state = "HOLD";
        if(this.callData.durationMs)
            this.callData.durationMs = this.callData.durationMs + ( new Date().getTime() - this.callData.timestamp );
        else
            this.callData.durationMs = new Date().getTime() - this.callData.timestamp;
        this.callData.timestamp = new Date().getTime();
        this.update.emit(this.callData);

    }
    backCall(){
        this.callData.state = "ACTIVE";
        this.callData.timestamp = new Date().getTime();
        this.hangCalls.emit(this.callData);
        this.update.emit(this.callData);

    }
    hangCall(){
        this.callData.state = "END";
        if(this.callData.durationMs)
            this.callData.durationMs = this.callData.durationMs + ( new Date().getTime() - this.callData.timestamp );
        else
            this.callData.durationMs = new Date().getTime() - this.callData.timestamp;
        this.update.emit(this.callData);

    }
    answearCall(){
        this.callData.state = "ACTIVE";
        this.callData.timestamp = new Date().getTime();
        this.update.emit(this.callData);
        this.hangCalls.emit(this.callData);


    }
    rejectCall(){
        this.callData.state = "REJECTED";
        this.update.emit(this.callData);
    }

    saveCaseData(_case:Case){
        this.caseService.save(_case).then(__case => {
            this._case = __case;

        });
    }

    setClasses(data){
        let classes =  {
            call__title: true,      // true
            hold: data.state==="HOLD", // false
            active: data.state==="ACTIVE", // false
            ring: data.state==="RING", // false
            end: (data.state==="END" || data.state==="REJECTED" || data.state==="MISSED")


        };
        return classes;
    }
    setDetailClasses(){
        let classes = {
            col: true,
            "col-12" : true,
            open: this.isDetailOpen
        };
        return classes;
    }

}
