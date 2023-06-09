import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MascotaPerfilRedirectPage } from './mascota-perfil-redirect.page';

describe('MascotaPerfilRedirectPage', () => {
  let component: MascotaPerfilRedirectPage;
  let fixture: ComponentFixture<MascotaPerfilRedirectPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MascotaPerfilRedirectPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MascotaPerfilRedirectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
