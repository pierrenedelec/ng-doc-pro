
import { Component, ChangeDetectionStrategy, input, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetInstance } from '../../../models/widget-instance.model';
import { DynamicHostComponent } from '../../dynamic-host/dynamic-host.component';

@Component({
  selector: 'app-widget-container',
  templateUrl: './container.component.html',
  imports: [CommonModule, DynamicHostComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContainerComponent {
  instance = input.required<WidgetInstance>();
  isPreviewMode = input(false);
  
  // Pass-through outputs from children to parent canvas
  remove = output<string>();
  edit = output<string>();
  widgetChange = output<WidgetInstance>();
  selectWidget = output<string>();
  ungroup = output<WidgetInstance>();
  
  label = computed(() => this.instance().props?.['label']);
  children = computed(() => this.instance().children || []);

  onChildWidgetChange(updatedChild: WidgetInstance): void {
    const updatedChildren = this.children().map(child => child.id === updatedChild.id ? updatedChild : child);
    this.widgetChange.emit({
      ...this.instance(),
      children: updatedChildren
    });
  }
}
