import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { UsersApiService } from '../../core/services/api/users.api.service';
import { PartsApiService } from '../../core/services/api/parts.api.service';
import { User } from '../../core/models/user.model';
import { Part } from '../../core/models/part.model';

@Injectable({ providedIn: 'root' })
export class PartVerificationStore {
  private readonly usersApi = inject(UsersApiService);
  private readonly partsApi = inject(PartsApiService);

  // Private writable state
  private readonly _users = signal<User[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly selectors
  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly usersCount = computed(() => this._users().length);

  // Parts list state
  private readonly _parts = signal<Part[]>([]);
  private readonly _partsLoading = signal(false);
  private readonly _partsError = signal<string | null>(null);

  readonly parts = this._parts.asReadonly();
  readonly partsLoading = this._partsLoading.asReadonly();
  readonly partsError = this._partsError.asReadonly();

  // Single part state
  private readonly _currentPart = signal<Part | null>(null);
  private readonly _currentPartLoading = signal(false);
  private readonly _currentPartError = signal<string | null>(null);

  readonly currentPart = this._currentPart.asReadonly();
  readonly currentPartLoading = this._currentPartLoading.asReadonly();
  readonly currentPartError = this._currentPartError.asReadonly();

  loadUsers(): void {
    this._loading.set(true);
    this._error.set(null);

    this.usersApi.getUsers().subscribe({
      next: (users) => {
        this._users.set(users);
        this._loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this._error.set(err.message ?? 'Failed to load users');
        this._loading.set(false);
      },
    });
  }

  loadPart(id: number | string): void {
    this._currentPartLoading.set(true);
    this._currentPartError.set(null);

    this.partsApi.getPartById(id).subscribe({
      next: (part) => {
        this._currentPart.set(part);
        this._currentPartLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this._currentPartError.set(err.message ?? 'Failed to load part');
        this._currentPartLoading.set(false);
      },
    });
  }

  loadParts(): void {
    this._partsLoading.set(true);
    this._partsError.set(null);

    this.partsApi.getParts().subscribe({
      next: (data) => {
        this._parts.set(data);
        this._partsLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this._partsError.set(err.message ?? 'Failed to load parts');
        this._partsLoading.set(false);
      },
    });
  }
}
