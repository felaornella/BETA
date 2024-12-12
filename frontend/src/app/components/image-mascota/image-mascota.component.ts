import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-image-mascota',
  templateUrl: './image-mascota.component.html',
  styleUrls: ['./image-mascota.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ImageMascotaComponent implements OnInit {

  @Input() imageUrl: string;

  constructor(private modalCtrl: ModalController) {}

  close() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {}

}