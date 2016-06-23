/**
 * Created by pedrorocha on 18/06/16.
 */
/// <reference path="../../typings/index.d.ts" />



import { bootstrap } from '@angular/platform-browser-dynamic'; // App Bootstrap
import { HTTP_PROVIDERS } from '@angular/http'; // Angular HTTP providers

import { AppComponent } from  './app.component'; // App Main Component

bootstrap(AppComponent, [
    HTTP_PROVIDERS
]);