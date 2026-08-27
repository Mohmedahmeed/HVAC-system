import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  exports: [
    ...sharedComponents,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
})
export class SharedModule {}
