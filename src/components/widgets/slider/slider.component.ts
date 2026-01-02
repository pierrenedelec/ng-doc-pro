
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { WidgetInstance } from '../../../models/widget-instance.model';

@Component({
  selector: 'app-widget-slider',
  template: `
    <div class="flex items-center gap-2 w-full p-4">
        <label [for]="id()" class="text-slate-700 text-sm">{{ label() }}</label>
        <input type="range" [id]="id()" min="0" max="100" value="50" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer">
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent {
  instance = input.required<WidgetInstance>();
  label = computed(() => this.instance().props?.['label'] || 'Range');
  id = computed(() => 'slider-' + this.instance().id);
}
