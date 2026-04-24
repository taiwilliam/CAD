import { Component, effect, inject, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import {
  PART_VERIFICATION_STATUS_LABEL,
  PartVerificationStatus,
  partVerificationItems,
} from '../part-verification.data';
import { PartVerificationStore } from '../part-verification.store';

@Component({
  selector: 'app-part-verification-list',
  standalone: true,
  imports: [
    NgClass,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
  ],
  templateUrl: './part-verification-list.component.html',
  styleUrl: './part-verification-list.component.scss',
})
export class PartVerificationListComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly store = inject(PartVerificationStore);

  constructor() {
    effect(() => {
      const users = this.store.users();
      if (users.length > 0) {
        console.log('[PartVerificationList] users loaded:', users);
        // 只取第一個 user 示範
        const first = users[0];
        if (first) {
          console.log('第一位 user name:', first.name);
          console.log('第一位 user email:', first.email);
        }
      }
    });
  }

  protected readonly statusLabelMap = PART_VERIFICATION_STATUS_LABEL;
  protected readonly statusClassMap: Record<PartVerificationStatus, string> = {
    [PartVerificationStatus.Pending]: 'bg-amber-100 text-amber-700',
    [PartVerificationStatus.Completed]: 'bg-emerald-100 text-emerald-700',
  };
  protected readonly parts = partVerificationItems;
  protected readonly completedCount = this.parts.filter(
    (part) => part.status === PartVerificationStatus.Completed,
  ).length;
  protected readonly categorySummary = '螺絲';
  protected readonly displayedColumns = [
    'partNumber',
    'partName',
    'standard',
    'material',
    'revision',
    'owner',
    'updatedAt',
    'status',
    'actions',
  ] as const;

  protected getStatusLabel(status: PartVerificationStatus): string {
    return this.statusLabelMap[status];
  }

  protected getStatusClass(status: PartVerificationStatus): string {
    return this.statusClassMap[status];
  }

  ngOnInit(): void {
    this.store.loadUsers();
  }

  protected openDetail(id: string): void {
    void this.router.navigate(['/part-verification', id]);
  }
}
