import type { ComponentType, SvelteComponent } from "svelte";
import { get, writable, type Subscriber, type Writable } from "svelte/store";
import { activeWindow, windowListTitleRefresh, windowsNew } from "../../stores/global";

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

  public data = {
    zindex: writable(0)
  }

  /* -------------------------------------------------------------------------- */

  constructor(uuid: string, component: string, toolbarComponent: string) {
    this.uuid = uuid;
    this.component = component;
    this.toolbarComponent = toolbarComponent;
    let highestValue = 0;

    const windows = get(windowsNew);
    for (const window of windows) {
      highestValue = Math.max(0, get(window.data.zindex));
      this.data.zindex.set(highestValue + 10)
    };
  }

  protected updateZindex(value: number) {
    this.data.zindex.set(value)
  }

  public setForeground() {
    this.updateZindex(500);

    const windows = get(windowsNew);
    windows.sort((a, b) => get(a.data.zindex) - get(b.data.zindex))

    let i = 0;
    for (const window of windows) {
      window.updateZindex(i);
      i++;
    }

    activeWindow.set(this.uuid)
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

