import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { buildApiUrl, apiConfig } from '../config/api.config';
import { Group, GroupPayload } from '../../shared/models/group.models';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private readonly http = inject(HttpClient);
  private readonly groupsEndpoint = apiConfig.endpoints.groups;

  list(): Observable<Group[]> {
    return this.http.get<Group[]>(buildApiUrl(this.groupsEndpoint));
  }

  create(payload: GroupPayload): Observable<Group> {
    return this.http.post<Group>(buildApiUrl(this.groupsEndpoint), payload);
  }

  update(id: number, payload: GroupPayload): Observable<Group> {
    return this.http.put<Group>(buildApiUrl(`${this.groupsEndpoint}/${id}`), payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(buildApiUrl(`${this.groupsEndpoint}/${id}`));
  }
}
