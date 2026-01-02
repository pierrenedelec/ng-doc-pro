
import { Component, ChangeDetectionStrategy, signal, computed, effect, OnInit, inject, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WidgetDefinition } from './models/widget-definition.model';
import { WidgetInstance } from './models/widget-instance.model';
import { Page } from './models/page.model';
import { ComponentRegistryService } from './services/component-registry.service';
import { PersistenceService } from './services/persistence.service';
import { DynamicHostComponent } from './components/dynamic-host/dynamic-host.component';
import { EditModalComponent } from './components/edit-modal/edit-modal.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';

// Import all widget components to register them
import { ButtonComponent } from './components/widgets/button/button.component';
import { InputComponent } from './components/widgets/input/input.component';
import { RadioComponent } from './components/widgets/radio/radio.component';
import { BadgeComponent } from './components/widgets/badge/badge.component';
import { SliderComponent } from './components/widgets/slider/slider.component';
import { AvatarComponent } from './components/widgets/avatar/avatar.component';
import { ContainerComponent } from './components/widgets/container/container.component';
import { ChartComponent } from './components/widgets/chart/chart.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DynamicHostComponent, EditModalComponent, SafeHtmlPipe],
})
export class AppComponent implements OnInit {
  private registry = inject(ComponentRegistryService);
  private persistence = inject(PersistenceService);

  searchTerm = signal('');
  selectedWidgetType = signal('button');
  
  pages = signal<Page[]>([]);
  activePageId = signal<string | null>(null);
  editingWidget = signal<WidgetInstance | null>(null);
  editingPageId = signal<string | null>(null);
  isPreviewMode = signal(false);
  selectedWidgetIds = signal<Set<string>>(new Set());
  isComponentListCollapsed = signal(false);
  canvasContextMenu = signal<{ x: number; y: number; canvasX: number; canvasY: number } | null>(null);

  @ViewChildren('pageNameInput') pageNameInputs!: QueryList<ElementRef<HTMLInputElement>>;

  activePage = computed(() => this.pages().find(p => p.id === this.activePageId()));
  dashboardWidgets = computed(() => this.activePage()?.widgets || []);

  availableWidgets = signal<WidgetDefinition[]>([
    { type: 'button', name: 'Button', description: 'Trigger actions', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="12" x2="15" y2="12"></line></svg>' },
    { type: 'input', name: 'Input', description: 'Retrieve user input', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>' },
    { type: 'radio', name: 'Radio', description: 'Single choice input', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle></svg>' },
    { type: 'badge', name: 'Badge', description: 'Annotate context', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>' },
    { type: 'slider', name: 'Slider', description: 'Free range picker', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>' },
    { type: 'avatar', name: 'Avatar', description: 'Illustrate the user', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>' },
    { type: 'container', name: 'Container', description: 'Lay out the items', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>' },
    { type: 'chart', name: 'Chart', description: 'Visualize data', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M3 3v18h18"></path><path d="M18.7 8a2.4 2.4 0 0 0-3.4 0L12 11.4l-2.3-2.3a2.4 2.4 0 0 0-3.4 0L3 12.4"></path></svg>' }
  ]);

  filteredWidgets = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.availableWidgets();
    return this.availableWidgets().filter(w => w.name.toLowerCase().includes(term) || w.description.toLowerCase().includes(term));
  });

  constructor() {
    this.registry.register({
      button: ButtonComponent, input: InputComponent, radio: RadioComponent,
      badge: BadgeComponent, slider: SliderComponent, avatar: AvatarComponent,
      container: ContainerComponent, chart: ChartComponent
    });

    effect(() => this.persistence.savePages(this.pages()));
    
    effect(() => {
      if (this.editingPageId() !== null) {
        setTimeout(() => this.pageNameInputs.first?.nativeElement.focus(), 0);
      }
    });
  }

  ngOnInit() {
    const loadedPages = this.persistence.loadPages();
    this.pages.set(loadedPages);
    if (loadedPages.length > 0) {
      this.activePageId.set(loadedPages[0].id);
    }
  }
  
  toggleComponentList(): void {
    this.isComponentListCollapsed.update(v => !v);
  }

  onCanvasContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    this.canvasContextMenu.set({ 
        x: event.clientX, 
        y: event.clientY,
        canvasX: canvasX,
        canvasY: canvasY
    });

    document.addEventListener('click', this.closeCanvasContextMenu.bind(this), { once: true });
  }

  closeCanvasContextMenu(): void {
    this.canvasContextMenu.set(null);
  }

  toggleWidgetSelection(id: string) {
    this.selectedWidgetIds.update(currentSet => {
      const newSet = new Set(currentSet);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  clearSelection() {
    if (this.canvasContextMenu()) return;
    this.selectedWidgetIds.set(new Set());
  }

  groupSelection() {
    const page = this.activePage();
    if (!page) return;
    const selectedIds = this.selectedWidgetIds();
    if (selectedIds.size < 2) return;

    const selectedWidgets = page.widgets.filter(w => selectedIds.has(w.id));
    if (selectedWidgets.length === 0) return;

    const minX = Math.min(...selectedWidgets.map(w => w.x));
    const minY = Math.min(...selectedWidgets.map(w => w.y));
    const maxX = Math.max(...selectedWidgets.map(w => w.x + w.width));
    const maxY = Math.max(...selectedWidgets.map(w => w.y + w.height));

    const groupContainer: WidgetInstance = {
      id: crypto.randomUUID(),
      type: 'container',
      x: minX - 20,
      y: minY - 20,
      width: maxX - minX + 40,
      height: maxY - minY + 40,
      props: { label: '' },
      children: selectedWidgets.map(w => ({
        ...w,
        x: w.x - (minX - 20),
        y: w.y - (minY - 20),
      })),
    };
    
    this.pages.update(pages => pages.map(p => p.id === page.id ? { ...p, widgets: [...p.widgets.filter(w => !selectedIds.has(w.id)), groupContainer] } : p));
    this.clearSelection();
  }

  ungroupWidget(container: WidgetInstance) {
    if (!container.children || container.children.length === 0) return;
    const page = this.activePage();
    if (!page) return;

    const releasedChildren = container.children.map(child => ({
      ...child,
      x: child.x + container.x,
      y: child.y + container.y,
    }));

    this.pages.update(pages => pages.map(p => p.id === page.id ? { ...p, widgets: [...p.widgets.filter(w => w.id !== container.id), ...releasedChildren] } : p));
  }
  
  togglePreviewMode() {
    this.isPreviewMode.update(v => !v);
  }

  addPage() {
    const newPage: Page = {
      id: crypto.randomUUID(),
      name: `Page ${this.pages().length + 1}`,
      widgets: []
    };
    this.pages.update(pages => [...pages, newPage]);
    this.activePageId.set(newPage.id);
  }

  selectPage(pageId: string) {
    this.activePageId.set(pageId);
    this.clearSelection();
  }

  deletePage(pageId: string, event: MouseEvent) {
    event.stopPropagation();
    this.pages.update(pages => pages.filter(p => p.id !== pageId));
    if (this.activePageId() === pageId) {
      this.activePageId.set(this.pages().length > 0 ? this.pages()[0].id : null);
    }
  }
  
  startEditingPageName(pageId: string, event: MouseEvent) {
    event.stopPropagation();
    this.editingPageId.set(pageId);
  }

  finishEditingPageName(page: Page, newName: string) {
    if (this.editingPageId() === null) return;
    this.editingPageId.set(null);
    if (newName.trim()) {
      this.pages.update(pages => pages.map(p => p.id === page.id ? { ...p, name: newName.trim() } : p));
    }
  }

  selectWidget(type: string) {
    this.selectedWidgetType.set(type);
    this.addWidget(type);
  }

  addWidget(type: string, position?: { x: number, y: number }) {
    const page = this.activePage();
    if (!page) return;
    const offset = (page.widgets.length % 10) * 20;
    const newWidget: WidgetInstance = {
      id: crypto.randomUUID(), 
      type, 
      x: position ? position.x - 90 : 50 + offset, // Center on cursor
      y: position ? position.y - 60 : 50 + offset, // Center on cursor
      width: 180, 
      height: 120, 
      props: this.getDefaultProps(type)
    };
    this.pages.update(pages => pages.map(p => p.id === page.id ? { ...p, widgets: [...p.widgets, newWidget] } : p));
    this.closeCanvasContextMenu();
  }
  
  private getDefaultProps(type: string): { [key: string]: any } {
    switch(type) {
      case 'button': return { text: 'Click Me' };
      case 'input': return { placeholder: 'Enter text...' };
      case 'badge': return { text: 'New!' };
      case 'radio': return { label: 'Option 1' };
      case 'slider': return { label: 'Value' };
      case 'avatar': return { src: 'https://picsum.photos/40' };
      case 'container': return { label: 'Container' };
      case 'chart': return { data: '10,40,25,50,15' };
      default: return {};
    }
  }

  removeWidget(id: string) {
    const page = this.activePage();
    if (!page) return;

    const removeRecursively = (widgets: WidgetInstance[], widgetId: string): WidgetInstance[] => {
      return widgets.reduce((acc, w) => {
        if (w.id === widgetId) {
          return acc;
        }
        if (w.children) {
          w.children = removeRecursively(w.children, widgetId);
        }
        acc.push(w);
        return acc;
      }, [] as WidgetInstance[]);
    };

    this.pages.update(pages => pages.map(p => p.id === page.id ? { ...p, widgets: removeRecursively(p.widgets, id) } : p));
  }

  updateWidget(updatedWidget: WidgetInstance) {
    const page = this.activePage();
    if (!page) return;

    const updateRecursively = (widgets: WidgetInstance[], widget: WidgetInstance): WidgetInstance[] => {
      return widgets.map(w => {
        if (w.id === widget.id) {
          return widget;
        }
        if (w.children) {
          w.children = updateRecursively(w.children, widget);
        }
        return w;
      });
    };
    
    this.pages.update(pages => pages.map(p => p.id === page.id ? { ...p, widgets: updateRecursively(p.widgets, updatedWidget) } : p));
  }

  openEditModal(id: string) {
    const findWidget = (widgets: WidgetInstance[], widgetId: string): WidgetInstance | undefined => {
      for (const w of widgets) {
        if (w.id === widgetId) return w;
        if (w.children) {
          const found = findWidget(w.children, widgetId);
          if (found) return found;
        }
      }
      return undefined;
    };
    const widget = findWidget(this.dashboardWidgets(), id);
    if (widget) this.editingWidget.set(widget);
  }

  closeEditModal() {
    this.editingWidget.set(null);
  }

  saveWidgetChanges(updatedProps: { [key: string]: any }) {
    const currentWidget = this.editingWidget();
    if (currentWidget) {
      this.updateWidget({ ...currentWidget, props: updatedProps });
    }
    this.closeEditModal();
  }
}
