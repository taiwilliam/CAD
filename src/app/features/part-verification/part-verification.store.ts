import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { UsersApiService } from '../../core/services/api/users.api.service';
import { User } from '../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class PartVerificationStore {
  private readonly usersApi = inject(UsersApiService);

  // Private writable state
  private readonly _users = signal<User[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly selectors
  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly usersCount = computed(() => this._users().length);

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
}
