
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { WidgetInstance } from '../../../models/widget-instance.model';

@Component({
  selector: 'app-widget-input',
  template: `
    <input type="text" [placeholder]="placeholder()" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
  instance = input.required<WidgetInstance>();
  placeholder = computed(() => this.instance().props?.['placeholder'] || '');
}
