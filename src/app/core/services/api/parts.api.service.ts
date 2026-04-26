import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api.constants';
import { Part } from '../../models/part.model';

@Injectable({ providedIn: 'root' })
export class PartsApiService {
  private readonly http = inject(HttpClient);

  getParts(): Observable<Part[]> {
    return this.http
      .get<{ data: Part[] }>(`${environment.apiBaseUrl}${API_ENDPOINTS.PARTS}`)
      .pipe(map((res) => res.data));
  }

  getPartById(id: number | string): Observable<Part> {
    return this.http
      .get<{ data: Part }>(`${environment.apiBaseUrl}${API_ENDPOINTS.PARTS}/${id}`)
      .pipe(map((res) => res.data));
  }
}
