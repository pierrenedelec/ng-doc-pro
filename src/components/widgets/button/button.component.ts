
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { WidgetInstance } from '../../../models/widget-instance.model';

@Component({
  selector: 'app-widget-button',
  template: `
    <button class="w-full h-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center">
      {{ text() }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  instance = input.required<WidgetInstance>();
  text = computed(() => this.instance().props?.['text'] || 'Button');
}
