import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GroupsService } from '../../../../core/services/groups.service';
import { Group } from '../../../../shared/models/group.models';
import { getGroupRequestErrorMessage } from '../../utils/group-request-error.util';
import {
  GroupDialogComponent,
  GroupDialogResult
} from '../../components/group-dialog/group-dialog.component';

@Component({
  selector: 'app-groups-page',
  imports: [
    DatePipe,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './groups-page.component.html',
  styleUrl: './groups-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupsPageComponent {
  private readonly groupsService = inject(GroupsService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly groups = signal<Group[]>([]);
  protected readonly isLoadingGroups = signal(true);
  protected readonly deletingGroupId = signal<number | null>(null);
  protected readonly loadError = signal<string | null>(null);

  constructor() {
    this.loadGroups();
  }

  protected openCreateGroupForm(): void {
    this.openGroupDialog(null);
  }

  protected openGroup(group: Group): void {
    void this.router.navigate(['/groups', group.id]);
  }

  protected startEditGroup(event: MouseEvent, group: Group): void {
    event.stopPropagation();
    this.openGroupDialog(group);
  }

  protected deleteGroup(event: MouseEvent, group: Group): void {
    event.stopPropagation();
    this.deletingGroupId.set(group.id);

    this.groupsService
      .delete(group.id)
      .pipe(
        finalize(() => this.deletingGroupId.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.groups.update((currentGroups) =>
            currentGroups.filter((currentGroup) => currentGroup.id !== group.id)
          );

          this.snackBar.open('Grupo excluido com sucesso. Os documentos voltam para Home.', 'Fechar', {
            duration: 3500
          });
        },
        error: (error: unknown) => {
          const message = getGroupRequestErrorMessage(error, {
            fallback: 'Nao foi possivel excluir o grupo.'
          });

          this.snackBar.open(message, 'Fechar', {
            duration: 4500
          });
        }
      });
  }

  protected reloadGroups(): void {
    this.loadGroups();
  }

  private loadGroups(): void {
    this.isLoadingGroups.set(true);
    this.loadError.set(null);

    this.groupsService
      .list()
      .pipe(
        finalize(() => this.isLoadingGroups.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (groups) => this.groups.set(groups),
        error: (error: unknown) => {
          const message = getGroupRequestErrorMessage(error, {
            fallback: 'Nao foi possivel carregar os grupos.'
          });

          this.loadError.set(message);
          this.snackBar.open(message, 'Fechar', {
            duration: 4500
          });
        }
      });
  }

  private openGroupDialog(group: Group | null): void {
    const dialogRef = this.dialog.open<GroupDialogComponent, { group: Group | null }, GroupDialogResult>(
      GroupDialogComponent,
      {
        data: { group },
        autoFocus: false,
        width: 'min(32rem, calc(100vw - 2rem))',
        maxWidth: '32rem'
      }
    );

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result) {
          return;
        }

        this.groups.update((currentGroups) => {
          if (result.mode === 'create') {
            return [result.group, ...currentGroups];
          }

          return currentGroups.map((currentGroup) =>
            currentGroup.id === result.group.id ? result.group : currentGroup
          );
        });

        this.snackBar.open(
          result.mode === 'create' ? 'Grupo criado com sucesso.' : 'Grupo atualizado com sucesso.',
          'Fechar',
          {
            duration: 3500
          }
        );
      });
  }
}
