import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { getUrlImg } from 'src/app/utils/utils';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-publication-item',
  templateUrl: './publication-item.component.html',
  styleUrls: ['./publication-item.component.scss'],
})
export class PublicationItemComponent implements OnInit {
  @Input() publi: any;
  getUrlImg = getUrlImg;

  constructor() { }

  ngOnInit() {}

}
