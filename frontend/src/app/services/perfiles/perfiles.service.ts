import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PerfilesService {

  private URL_API= environment.baseApiUrl

  constructor() { }
}
