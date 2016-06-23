/**
 * Created by pedrorocha on 18/06/16.
 *
 * CallService
 *
 * Call's Backend connection, also an Event Emitter that simulates incoming call's
 *
 */
import { Injectable, OnDestroy }    from '@angular/core';  //Angular Core Files
import { Headers, Http } from '@angular/http'; //Angular HTTP Classes/Providers
import { Subject }    from 'rxjs/Subject';//Subject for use with Observable
import '../rxjs-operators'; // Import RXJS Operators
import { Call } from '../models/call';// Contact data model

@Injectable()
export class CallService implements OnDestroy {

    private apiUrl = 'http://localhost:3000/calls';  // URL to web api

    // Observable to emit events when an Call is updated
    private updateCallback = new Subject<Call>();
    updateCallback$ = this.updateCallback.asObservable();

    // Observable to emit events when an Call is created
    private createCallback = new Subject<Call>();
    createCallback$ = this.createCallback.asObservable();




    // Timeout reference
    private timeOut = null;

    //Random Number List
    private randomNumberList:string[] = ["+351923332222","+351933332222","+351913332222","+351923232222","+351923331222","+351922332222"];

    //Phone Numbers to Simulate a Call Event
    private callList: string[];


    /*
     CaseService constructor
     @param http:Http
     @return classInstance
     */
    constructor(private http: Http) { }

    //Retrieves all the Call Objects from the API
    getCalls(): Promise<Call[]> {
        return this.http.get(this.apiUrl)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    //Retrieves a Call by sending it's ID
    getCall(id: number) {
        return this.getCalls()
            .then(calls => calls.filter(call => call.id === id)[0]);
    }


    //Saves a Call Object in the API
    save(call: Call): Promise<Call>  {


        if (call.id) {
            return this.put(call);
        }


        return this.post(call);
    }

    //Return a random Phone number from the randomNumberList
    private getRandomPhone():string {
        let min = 0, max = this.randomNumberList.length;


        return ""+this.randomNumberList[Math.floor(Math.random() * max) + min];
    }
    //Return a random Phone number from the callList to simulate an Incoming call
    private getRandomCall():string {
        let min = 0, max = this.callList.length;

        let selection = Math.floor(Math.random() * max) + min;
        let returnValue:string = ""+this.callList[selection];
        this.callList.splice(selection,1);

        return ""+returnValue;
    }

    // Sets a Timeout that creates/simulates a new Incoming Call on the APP, every 1 min
    private prepareForCall(){
        clearTimeout(this.timeOut);
        if(this.callList.length>0) {
            this.timeOut = setTimeout(() => {

                let call:Call = new Call();
                call.number = "" + this.getRandomCall();
                call.state = "RING";
                call.timestamp = new Date().getTime();

                console.log("-> CallService::Call Incoming :: ", call);

                this.post(call).then(_call => {

                    this.createCallback.next(_call);
                });
                this.prepareForCall();


            }, 60000);
        }
    }

    //Generates a new list of phone numbers to be used in simulation containing all the contacts and leads currently stored in the API
    setCallList(numbers : string[]){
        let total: number = numbers.length;
        let required : number = Math.ceil((100*total)/70)-total;
        this.callList = numbers;

        for(var i = 0; i<required; i++){
            this.callList.push(""+this.getRandomPhone());
        }


    }

    //Starts the Simulation
    startCallService():void {
        this.prepareForCall();
        console.log("-> CallService::Test Started");
    }

    //Trigger create Observable
    triggerCreate(call : Call){
        this.createCallback.next(call);
    }


    // Add new Call
    private post(call: Call): Promise<Call> {
        let headers = new Headers({
            'Content-Type': 'application/json'});

        let c: Call = new Call();
        if(call.id)
            c.id = call.id;
        c.durationMs = call.durationMs;
        c.number = ''+call.number;
        c.state = call.state;
        c.timestamp = call.timestamp;

        return this.http.post(this.apiUrl, JSON.stringify(c), {headers: headers})
            .toPromise()
            .then(res => res.json())
            .catch(this.handleError);
    }

    // Update existing Call
    private put(call: Call) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let url = `${this.apiUrl}/${call.id}`;
        let c: Call = new Call();
        if(call.id)
            c.id = call.id;
        c.durationMs = call.durationMs;
        c.number = ""+call.number;
        c.state = call.state;
        c.timestamp = call.timestamp;
        this.updateCallback.next(c);
        return this.http.put(url, JSON.stringify(c), {headers: headers})
            .toPromise()
            .then(() => c)
            .catch(this.handleError);
    }

    //Handle Erros
    private handleError(error: any) {
        console.error('-> CallService::An error occurred', error);
        return Promise.reject(error.message || error);
    }

    // Destroy the timeout instance if active.
    ngOnDestroy(){
        this.createCallback = null;
        this.createCallback$ = null;

        this.updateCallback = null;
        this.updateCallback$ = null;

        clearTimeout(this.timeOut);
    }
}
