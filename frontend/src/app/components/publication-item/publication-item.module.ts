import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PublicationItemComponent } from './publication-item.component';
@NgModule({
  declarations: [PublicationItemComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [PublicationItemComponent]
})
export class PublicationItemModule { }