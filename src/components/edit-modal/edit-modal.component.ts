
import { Component, ChangeDetectionStrategy, input, output, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WidgetInstance } from '../../models/widget-instance.model';

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditModalComponent implements OnInit {
  widget = input.required<WidgetInstance>();
  save = output<{ [key: string]: any }>();
  close = output<void>();

  editableProps: { [key: string]: any } = {};
  
  widgetName = computed(() => {
    const type = this.widget().type;
    return type.charAt(0).toUpperCase() + type.slice(1);
  });

  ngOnInit(): void {
    // Clone props to avoid mutating the original object directly
    this.editableProps = { ...this.widget().props };
  }

  onSave(): void {
    this.save.emit(this.editableProps);
  }

  onClose(): void {
    this.close.emit();
  }
}
