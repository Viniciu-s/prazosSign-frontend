import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GroupsService } from '../../../../core/services/groups.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Group } from '../../../../shared/models/group.models';
import {
  DashboardSidebarComponent,
  DashboardSidebarItem
} from '../../components/dashboard-sidebar/dashboard-sidebar.component';
import { getGroupRequestErrorMessage } from '../../utils/group-request-error.util';
import {
  GroupDialogComponent,
  GroupDialogResult
} from '../../components/group-dialog/group-dialog.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    DatePipe,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    DashboardSidebarComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  private readonly authService = inject(AuthService);
  private readonly groupsService = inject(GroupsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sidebarDefinitions = [
    {
      label: 'Home',
      description: 'Visao geral do workspace'
    },
    {
      label: 'Grupos',
      description: 'Pastas e times de trabalho'
    },
    {
      label: 'Documentos',
      description: 'Biblioteca completa'
    },
    {
      label: 'Pendentes',
      description: 'Acoes aguardando assinatura'
    },
    {
      label: 'Perfil',
      description: 'Dados e preferencias'
    }
  ] as const;

  protected readonly user = this.authService.user;
  protected readonly groups = signal<Group[]>([]);
  protected readonly isLoadingGroups = signal(true);
  protected readonly isLoggingOut = signal(false);
  protected readonly deletingGroupId = signal<number | null>(null);
  protected readonly loadError = signal<string | null>(null);
  protected readonly activeSidebarItem = signal('Home');
  protected readonly sidebarItems = computed<readonly DashboardSidebarItem[]>(() =>
    this.sidebarDefinitions.map((item) => ({
      ...item,
      active: item.label === this.activeSidebarItem()
    }))
  );
  protected readonly isGroupsSection = computed(() => {
    const activeItem = this.activeSidebarItem();
    return activeItem === 'Home' || activeItem === 'Grupos';
  });
  protected readonly sectionEyebrow = computed(() => this.activeSidebarItem());
  protected readonly sectionTitle = computed(() => {
    switch (this.activeSidebarItem()) {
      case 'Grupos':
        return 'Gerencie grupos do seu workspace.';
      case 'Documentos':
        return 'Documentos em breve nesta area.';
      case 'Pendentes':
        return 'Pendencias ficarao centralizadas aqui.';
      case 'Perfil':
        return 'Perfil e preferencias em construcao.';
      case 'Home':
      default:
        return 'Grupos para organizar seus documentos.';
    }
  });
  protected readonly sectionDescription = computed(() => {
    switch (this.activeSidebarItem()) {
      case 'Grupos':
        return 'Crie, edite e remova grupos para organizar os documentos por contexto ou equipe.';
      case 'Documentos':
        return 'Esta secao vai reunir a biblioteca completa de documentos, filtros e historico.';
      case 'Pendentes':
        return 'Aqui vamos listar o que ainda depende de assinatura, validacao ou acompanhamento.';
      case 'Perfil':
        return 'Nesta area vamos concentrar dados da conta, preferencias e configuracoes do usuario.';
      case 'Home':
      default:
        return 'Crie grupos, consulte a listagem, atualize nomes e remova itens sem sair do dashboard.';
    }
  });

  constructor() {
    this.loadGroups();
  }

  protected openCreateGroupForm(): void {
    this.openGroupDialog(null);
  }

  protected startEditGroup(group: Group): void {
    this.openGroupDialog(group);
  }

  protected handleSidebarItemClick(label: string): void {
    this.activeSidebarItem.set(label);
  }

  protected deleteGroup(group: Group): void {
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

          this.snackBar.open('Grupo excluido com sucesso.', 'Fechar', {
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

  protected logout(): void {
    this.isLoggingOut.set(true);

    this.authService
      .logout()
      .pipe(
        finalize(() => this.isLoggingOut.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.snackBar.open('Sessao encerrada.', 'Fechar', {
          duration: 3000
        });

        void this.router.navigate(['/login']);
      });
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
        next: (groups) => {
          this.groups.set(groups);
        },
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
