import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import {
  NgbNavModule,
  NgbCarouselModule,
  NgbModalModule,
} from '@ng-bootstrap/ng-bootstrap';

import {
  LazyLoadImageModule,
  LAZYLOAD_IMAGE_HOOKS,
  ScrollHooks,
} from 'ng-lazyload-image';

import { NgxScrollTopModule } from 'ngx-scrolltop';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgbNavModule,
    NgbCarouselModule,
    NgbModalModule,
    FormsModule,
    RouterModule.forRoot([]),
    LazyLoadImageModule,
    NgxScrollTopModule
  ],
  providers: [{ provide: LAZYLOAD_IMAGE_HOOKS, useClass: ScrollHooks }],
  bootstrap: [AppComponent],
})
export class AppModule {}
