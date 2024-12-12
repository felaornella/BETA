import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MascotaPerfil, Pet } from 'src/app/models/Pet';

@Component({
  selector: 'app-own-pets',
  templateUrl: './own-pets.component.html',
  styleUrls: ['./own-pets.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class OwnPetsComponent implements OnInit {
  @Input() ownPets: Array<MascotaPerfil>;
  constructor() { }

  ngOnInit() {}

}
