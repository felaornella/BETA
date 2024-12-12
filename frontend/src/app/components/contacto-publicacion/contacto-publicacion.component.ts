import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacto-publicacion',
  templateUrl: './contacto-publicacion.component.html',
  styleUrls: ['./contacto-publicacion.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ContactoPublicacionComponent implements OnInit {
  @Input() publicador: any; // Tipo específico según tu modelo de datos

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}
  close() {
    this.modalCtrl.dismiss();
  }
}