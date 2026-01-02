
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { WidgetInstance } from '../../../models/widget-instance.model';

@Component({
  selector: 'app-widget-badge',
  template: `
    <div class="w-full h-full flex items-center justify-center">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        {{ text() }}
      </span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  instance = input.required<WidgetInstance>();
  text = computed(() => this.instance().props?.['text'] || 'Badge');
}
