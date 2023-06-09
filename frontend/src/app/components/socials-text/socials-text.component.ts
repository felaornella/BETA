import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-socials-text',
  templateUrl: './socials-text.component.html',
  styleUrls: ['./socials-text.component.scss'],
})
export class SocialsTextComponent implements OnInit {
  @Input() email: string;
  @Input() instagram: string;
  @Input() phone: string;
  @Input() emailVisible: boolean;
  @Input() instagramVisible: boolean;
  @Input() phoneVisible: boolean;
  constructor() { }

  ngOnInit() {}

}
