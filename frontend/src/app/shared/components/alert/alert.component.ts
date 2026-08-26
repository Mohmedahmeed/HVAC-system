import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent {
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() message: string = '';
  @Input() dismissible: boolean = false;
  @Output() dismiss = new EventEmitter<void>();

  get icon(): string {
    const icons: Record<string, string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    return icons[this.type] || 'info';
  }

  onDismiss(): void {
    this.dismiss.emit();
  }
}
