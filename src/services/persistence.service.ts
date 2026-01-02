
import { Injectable } from '@angular/core';
import { WidgetInstance } from '../models/widget-instance.model';
import { Page } from '../models/page.model';

const STORAGE_KEY = 'dynamicDashboardState_pages';

@Injectable({ providedIn: 'root' })
export class PersistenceService {

  savePages(pages: Page[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  loadPages(): Page[] {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        return JSON.parse(savedState);
      }
      return [this.createDefaultLoginPage()];
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return [this.createDefaultLoginPage()];
    }
  }

  private createDefaultLoginPage(): Page {
    const loginPageId = crypto.randomUUID();
    return {
      id: loginPageId,
      name: 'Login Page',
      widgets: [
        {
          id: crypto.randomUUID(), type: 'container', x: 100, y: 80, width: 420, height: 320,
          props: { label: '' }
        },
        {
          id: crypto.randomUUID(), type: 'avatar', x: 280, y: 110, width: 60, height: 60,
          props: { src: 'https://i.pravatar.cc/60' }
        },
        {
          id: crypto.randomUUID(), type: 'input', x: 130, y: 190, width: 360, height: 50,
          props: { placeholder: 'Username' }
        },
        {
          id: crypto.randomUUID(), type: 'input', x: 130, y: 250, width: 360, height: 50,
          props: { placeholder: 'Password' }
        },
        {
          id: crypto.randomUUID(), type: 'button', x: 130, y: 315, width: 360, height: 55,
          props: { text: 'Sign In' }
        }
      ]
    };
  }
}
