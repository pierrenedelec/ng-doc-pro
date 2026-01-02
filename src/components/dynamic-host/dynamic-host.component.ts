
import { Component, ChangeDetectionStrategy, computed, input, output, inject, signal, OnDestroy } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { WidgetInstance } from '../../models/widget-instance.model';
import { ComponentRegistryService } from '../../services/component-registry.service';

@Component({
  selector: 'app-dynamic-host',
  templateUrl: './dynamic-host.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet],
  host: {
    '(mousedown)': 'onMouseDown($event)',
    '(click)': 'onClick($event)',
    '(contextmenu)': 'onContextMenu($event)',
    '[style.position]': "'absolute'",
    '[style.left.px]': 'instance().x',
    '[style.top.px]': 'instance().y',
    '[style.width.px]': 'instance().width',
    '[style.height.px]': 'instance().height',
    '[class.group]': 'true',
    '[class.z-10]': 'isDragging() || isResizing()',
    '[class.cursor-grab]': '!isResizing() && !isPreviewMode() && !instance().ui?.locked',
    '[class.cursor-grabbing]': 'isDragging()',
    '[class.cursor-default]': 'instance().ui?.locked',
    '[class.pointer-events-none]': 'isPreviewMode()',
  }
})
export class DynamicHostComponent implements OnDestroy {
  private registry = inject(ComponentRegistryService);
  
  instance = input.required<WidgetInstance>();
  isPreviewMode = input(false);
  isSelected = input(false);
  remove = output<string>();
  edit = output<string>();
  widgetChange = output<WidgetInstance>();
  selectWidget = output<string>();
  ungroup = output<WidgetInstance>();

  componentType = computed(() => this.registry.getComponentType(this.instance().type));

  isDragging = signal(false);
  isResizing = signal(false);
  contextMenu = signal<{ x: number; y: number } | null>(null);

  private resizeHandle: string | null = null;
  private dragStart = { x: 0, y: 0 };
  private widgetStart = { x: 0, y: 0, width: 0, height: 0 };

  private readonly onMouseMoveListener = this.onMouseMove.bind(this);
  private readonly onMouseUpListener = this.onMouseUp.bind(this);
  private readonly onGlobalClickListener = this.closeContextMenu.bind(this);

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onGlobalClickListener);
  }

  onClick(event: MouseEvent) {
    if (this.isPreviewMode()) return;
    event.stopPropagation();
    if (event.shiftKey) {
      this.selectWidget.emit(this.instance().id);
    }
  }

  onContextMenu(event: MouseEvent): void {
    if (this.isPreviewMode()) return;
    event.preventDefault();
    event.stopPropagation();
    this.contextMenu.set({ x: event.clientX, y: event.clientY });
    document.addEventListener('click', this.onGlobalClickListener, { once: true });
  }

  closeContextMenu(): void {
    this.contextMenu.set(null);
  }

  toggleSemiStroke(event: MouseEvent): void {
    event.stopPropagation();
    this.widgetChange.emit({
      ...this.instance(),
      ui: { ...this.instance().ui, semiStroke: !this.instance().ui?.semiStroke }
    });
    this.closeContextMenu();
  }

  toggleLock(event: MouseEvent): void {
    event.stopPropagation();
    this.widgetChange.emit({
      ...this.instance(),
      ui: { ...this.instance().ui, locked: !this.instance().ui?.locked }
    });
    this.closeContextMenu();
  }

  onUngroup(event: MouseEvent): void {
    event.stopPropagation();
    this.ungroup.emit(this.instance());
    this.closeContextMenu();
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button !== 0 || this.isResizing() || this.isPreviewMode() || event.shiftKey || this.instance().ui?.locked) return; 

    const target = event.target as HTMLElement;
    if (target.closest('.js-no-drag')) return;

    this.isDragging.set(true);
    this.dragStart = { x: event.clientX, y: event.clientY };
    const widget = this.instance();
    this.widgetStart = { x: widget.x, y: widget.y, width: widget.width, height: widget.height };
    
    document.addEventListener('mousemove', this.onMouseMoveListener);
    document.addEventListener('mouseup', this.onMouseUpListener, { once: true });
    
    event.preventDefault();
  }

  onResizeStart(event: MouseEvent, handle: string): void {
    if (event.button !== 0 || this.isPreviewMode() || this.instance().ui?.locked) return;
    event.stopPropagation();
    
    this.isResizing.set(true);
    this.resizeHandle = handle;
    this.dragStart = { x: event.clientX, y: event.clientY };
    const widget = this.instance();
    this.widgetStart = { x: widget.x, y: widget.y, width: widget.width, height: widget.height };

    document.addEventListener('mousemove', this.onMouseMoveListener);
    document.addEventListener('mouseup', this.onMouseUpListener, { once: true });
    
    event.preventDefault();
  }

  private onMouseMove(event: MouseEvent): void {
    if (this.isDragging()) {
      const dx = event.clientX - this.dragStart.x;
      const dy = event.clientY - this.dragStart.y;
      this.widgetChange.emit({ ...this.instance(), x: this.widgetStart.x + dx, y: this.widgetStart.y + dy });
    } else if (this.isResizing()) {
      const dx = event.clientX - this.dragStart.x;
      const dy = event.clientY - this.dragStart.y;
      
      let newX = this.widgetStart.x;
      let newY = this.widgetStart.y;
      let newWidth = this.widgetStart.width;
      let newHeight = this.widgetStart.height;

      if (this.resizeHandle?.includes('e')) newWidth = this.widgetStart.width + dx;
      if (this.resizeHandle?.includes('w')) {
        newWidth = this.widgetStart.width - dx;
        newX = this.widgetStart.x + dx;
      }
      if (this.resizeHandle?.includes('s')) newHeight = this.widgetStart.height + dy;
      if (this.resizeHandle?.includes('n')) {
        newHeight = this.widgetStart.height - dy;
        newY = this.widgetStart.y + dy;
      }

      this.widgetChange.emit({ ...this.instance(), x: newX, y: newY, width: Math.max(80, newWidth), height: Math.max(50, newHeight) });
    }
  }

  private onMouseUp(): void {
    this.isDragging.set(false);
    this.isResizing.set(false);
    this.resizeHandle = null;
    document.removeEventListener('mousemove', this.onMouseMoveListener);
  }

  onEditClick(event: MouseEvent) {
    event.stopPropagation();
    this.edit.emit(this.instance().id);
  }

  onRemoveClick(event: MouseEvent): void {
    event.stopPropagation();
    this.remove.emit(this.instance().id);
  }
}
