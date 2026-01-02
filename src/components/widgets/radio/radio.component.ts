
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { WidgetInstance } from '../../../models/widget-instance.model';

@Component({
  selector: 'app-widget-radio',
  template: `
    <div class="flex items-center justify-center w-full h-full gap-2">
      <input type="radio" [id]="id()" name="radio-widget" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300" checked>
      <label [for]="id()" class="text-slate-700">{{ label() }}</label>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioComponent {
  instance = input.required<WidgetInstance>();
  label = computed(() => this.instance().props?.['label'] || 'Radio');
  id = computed(() => 'radio-' + this.instance().id);
}
