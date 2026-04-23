import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiConfig, buildApiUrl } from '../config/api.config';
import { DocumentItem } from '../../shared/models/document.models';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private readonly http = inject(HttpClient);

  list(): Observable<DocumentItem[]> {
    return this.http.get<DocumentItem[]>(buildApiUrl(apiConfig.endpoints.documents));
  }
}
