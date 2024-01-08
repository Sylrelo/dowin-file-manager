import { writable, type Subscriber, type Writable } from "svelte/store"
import { windowListTitleRefresh, windowsNew } from "../../stores/global";
import type { ComponentType, SvelteComponent } from "svelte";

interface WindowReactiveData {
  title: string,
}

export class Window {
  [key: string]: any
  public uuid: string = "";
  public ticon: string = ""

  public component: string = ""
  public toolbarComponent: string = "";

  public reactiveData: Writable<WindowReactiveData> = writable({
    title: "",
  });


  /* -------------------------------------------------------------------------- */

  constructor(uuid: string, component: string, toolbarComponent: string) {
    this.uuid = uuid;
    this.component = component;
    this.toolbarComponent = toolbarComponent;
  }

  public static new(uuid: string, component: string, toolbarComponent: string) {
    windowsNew.update(old => ([...old, new Window(uuid, component, toolbarComponent)]))
  }

  public subscribe(sub: Subscriber<any>) {
    return this.reactiveData.subscribe(sub);
  }

  public close() {
    windowsNew.update(old => old.filter(win => win.uuid !== this.uuid));
  }

  public async loadComponent(component: string): Promise<ComponentType<SvelteComponent>> {
    const modules = import.meta.glob("../**/*.svelte");

    const module = await modules[`${component}.svelte`]();
    return await (module as any).default;
  }

  /* -------------------------------------------------------------------------- */

  set title(title: string) {
    this.reactiveData.update(old => ({ ...old, title }))
    windowListTitleRefresh.set(Date.now());
  }
}

