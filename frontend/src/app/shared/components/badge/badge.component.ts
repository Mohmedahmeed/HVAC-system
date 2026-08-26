import { Component, Input } from '@angular/core';

const STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  MATCHED: 'Matched',
  SENT: 'Sent',
  ACCEPTED: 'Accepted',
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  ROUTINE: 'Routine',
  URGENT: 'Urgent',
  EMERGENCY: 'Emergency',
};

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.css'],
})
export class BadgeComponent {
  @Input() status: string = '';

  get label(): string {
    return STATUS_LABELS[this.status?.toUpperCase()] || this.status;
  }

  get cssClass(): string {
    const normalized = this.status?.toLowerCase().replace(/\s+/g, '-') || '';
    return `ch-badge ch-badge--${normalized}`;
  }
}
