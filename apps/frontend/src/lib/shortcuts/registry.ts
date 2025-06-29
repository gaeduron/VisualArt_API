import { ComponentActions, ShortcutRegistry, ShortcutAction, ComponentName, ActionName, Registry } from './types';

/**
 * INTENTION: Central registry for component actions that can be shortcut-bound
 * REQUIRES: Components to register their actions
 * MODIFIES: Global action registry state
 * EFFECTS: Provides lookup mechanism for app-level shortcut binding
 * RETURNS: Registry interface for managing component actions
 * 
 * ASSUMPTIONS: Components register/unregister during mount/unmount
 * INVARIANTS: Action names are unique within component scope
 * GHOST STATE: Component lifecycle, action availability
 */

class ShortcutRegistryImpl implements ShortcutRegistry {
  private registry: Registry = {};

  register(component: ComponentName, actions: ComponentActions): void {
    this.registry[component] = actions;
  }

  unregister(component: ComponentName): void {
    delete this.registry[component];
  }

  getAction(component: ComponentName, actionName: ActionName): ShortcutAction | undefined {
    const componentActions = this.registry[component];
    return componentActions?.[actionName];
  }

  getAllActions(): Registry {
    return { ...this.registry };
  }
}

export const shortcutRegistry = new ShortcutRegistryImpl(); 