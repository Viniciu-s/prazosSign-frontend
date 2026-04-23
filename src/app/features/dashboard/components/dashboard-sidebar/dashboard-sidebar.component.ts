import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type DashboardSidebarItem = {
  readonly label: string;
  readonly description: string;
  readonly active?: boolean;
};

@Component({
  selector: 'app-dashboard-sidebar',
  templateUrl: './dashboard-sidebar.component.html',
  styleUrl: './dashboard-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardSidebarComponent {
  readonly items = input.required<readonly DashboardSidebarItem[]>();
  readonly userName = input<string>('Equipe Prazos Sign');
  readonly userEmail = input<string>('produto@prazos.sign');
  readonly isLoggingOut = input(false);
  readonly itemClick = output<string>();
  readonly logoutClick = output<void>();
}
