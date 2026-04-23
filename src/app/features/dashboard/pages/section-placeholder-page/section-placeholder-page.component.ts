import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-section-placeholder-page',
  templateUrl: './section-placeholder-page.component.html',
  styleUrl: './section-placeholder-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionPlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly title = this.route.snapshot.data['title'] as string;
  protected readonly description = this.route.snapshot.data['description'] as string;
}
