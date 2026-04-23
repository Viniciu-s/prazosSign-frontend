import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentsService } from '../../../../core/services/documents.service';
import { GroupsService } from '../../../../core/services/groups.service';
import { DocumentItem } from '../../../../shared/models/document.models';
import { Group } from '../../../../shared/models/group.models';

@Component({
  selector: 'app-group-documents-page',
  imports: [DatePipe, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './group-documents-page.component.html',
  styleUrl: './group-documents-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupDocumentsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly groupsService = inject(GroupsService);
  private readonly documentsService = inject(DocumentsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly groupId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly group = signal<Group | null>(null);
  protected readonly documents = signal<DocumentItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  constructor() {
    this.loadGroupDocuments();
  }

  protected goBack(): void {
    void this.router.navigate(['/groups']);
  }

  protected getStatusLabel(status: string): string {
    return status.replaceAll('_', ' ');
  }

  private loadGroupDocuments(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      groups: this.groupsService.list(),
      documents: this.documentsService.list()
    })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ groups, documents }) => {
          const group = groups.find((item) => item.id === this.groupId) ?? null;

          if (!group) {
            this.loadError.set('O grupo informado nao foi encontrado.');
            return;
          }

          this.group.set(group);
          this.documents.set(documents.filter((document) => document.groupId === this.groupId));
        },
        error: () => {
          const message = 'Nao foi possivel carregar os documentos deste grupo.';
          this.loadError.set(message);
          this.snackBar.open(message, 'Fechar', {
            duration: 4500
          });
        }
      });
  }
}
