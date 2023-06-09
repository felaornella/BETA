import { Component, Input, OnInit } from '@angular/core';
import { MascotaPerfil, Pet } from 'src/app/models/Pet';

@Component({
  selector: 'app-own-pets',
  templateUrl: './own-pets.component.html',
  styleUrls: ['./own-pets.component.scss'],
})
export class OwnPetsComponent implements OnInit {
  @Input() ownPets: Array<MascotaPerfil>;
  constructor() { }

  ngOnInit() {}

}
