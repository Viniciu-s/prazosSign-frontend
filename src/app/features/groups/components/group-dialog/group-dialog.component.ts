import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GroupsService } from '../../../../core/services/groups.service';
import { Group, GroupPayload } from '../../../../shared/models/group.models';
import { getGroupRequestErrorMessage } from '../../utils/group-request-error.util';

export interface GroupDialogData {
  group: Group | null;
}

export interface GroupDialogResult {
  group: Group;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-group-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './group-dialog.component.html',
  styleUrl: './group-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupDialogComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly groupsService = inject(GroupsService);
  private readonly dialogRef = inject(MatDialogRef<GroupDialogComponent, GroupDialogResult | null>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly data = inject<GroupDialogData>(MAT_DIALOG_DATA);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEditMode = computed(() => this.data.group !== null);
  protected readonly dialogTitle = computed(() =>
    this.isEditMode() ? 'Editar grupo' : 'Criar grupo'
  );
  protected readonly submitLabel = computed(() =>
    this.isEditMode() ? 'Atualizar grupo' : 'Salvar grupo'
  );
  protected readonly groupForm = this.formBuilder.group({
    name: this.formBuilder.control(this.data.group?.name ?? '', [
      Validators.required,
      Validators.maxLength(255)
    ])
  });

  protected close(): void {
    this.dialogRef.close(null);
  }

  protected submit(): void {
    if (this.groupForm.invalid) {
      this.groupForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    const payload: GroupPayload = {
      name: this.groupForm.getRawValue().name.trim()
    };
    const request$ = this.data.group
      ? this.groupsService.update(this.data.group.id, payload)
      : this.groupsService.create(payload);

    request$
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (group) => {
          this.dialogRef.close({
            group,
            mode: this.data.group ? 'edit' : 'create'
          });
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            getGroupRequestErrorMessage(error, {
              fallback: this.data.group
                ? 'Nao foi possivel atualizar o grupo.'
                : 'Nao foi possivel criar o grupo.'
            })
          );
        }
      });
  }

  protected getNameErrorMessage(): string {
    const control = this.groupForm.controls.name;

    if (control.hasError('required')) {
      return 'Campo obrigatorio.';
    }

    if (control.hasError('maxlength')) {
      return 'O nome do grupo pode ter no maximo 255 caracteres.';
    }

    return '';
  }
}
