
import { Injectable, Type } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ComponentRegistryService {
  private componentMap = new Map<string, Type<any>>();

  register(components: { [key: string]: Type<any> }) {
    for (const key in components) {
        if(Object.prototype.hasOwnProperty.call(components, key)) {
             this.componentMap.set(key, components[key]);
        }
    }
  }

  getComponentType(type: string): Type<any> | undefined {
    const componentType = this.componentMap.get(type);
    if (!componentType) {
        console.error(`Component type "${type}" not found in registry.`);
    }
    return componentType;
  }
}
