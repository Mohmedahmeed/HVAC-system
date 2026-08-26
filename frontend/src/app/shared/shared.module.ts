import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { BadgeComponent } from './components/badge/badge.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { SkeletonComponent } from './components/skeleton/skeleton.component';
import { AlertComponent } from './components/alert/alert.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

const sharedComponents = [
  BadgeComponent,
  EmptyStateComponent,
  SkeletonComponent,
  AlertComponent,
  ConfirmDialogComponent,
];

@NgModule({
  declarations: sharedComponents,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
  ],
  exports: [
    ...sharedComponents,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
  ],
})
export class SharedModule {}
