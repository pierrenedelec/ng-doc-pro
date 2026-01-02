
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { WidgetInstance } from '../../../models/widget-instance.model';

@Component({
  selector: 'app-widget-avatar',
  template: `
    <div class="w-full h-full flex items-center justify-center">
      <img [ngSrc]="src()" width="40" height="40" alt="User Avatar" class="rounded-full">
    </div>
  `,
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  instance = input.required<WidgetInstance>();
  src = computed(() => this.instance().props?.['src'] || 'https://picsum.photos/40');
}
