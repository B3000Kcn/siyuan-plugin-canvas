var l = Object.defineProperty;
var e = (n, i, o) => i in n ? l(n, i, { enumerable: !0, configurable: !0, writable: !0, value: o }) : n[i] = o;
var s = (n, i, o) => e(n, typeof i != "symbol" ? i + "" : i, o);
import { Plugin as a, getFrontend as d } from "siyuan";
const c = "ai_assistant_dock";
class m extends a {
  constructor() {
    super(...arguments);
    s(this, "isMobile");
  }
  async onload() {
    console.log("loading siyuan-plugin-canvas...", this.i18n);
    const o = d();
    this.isMobile = o === "mobile" || o === "browser-mobile", this.addIcons('<symbol id="iconComment" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M896 128H128C83.8 128 48 163.8 48 208v448c0 44.2 35.8 80 80 80h176v128l237.6-128H896c44.2 0 80-35.8 80-80V208c0-44.2-35.8-80-80-80z m-48 480H581.8L512 651.7V608H176V256h672v352z" fill="#515151"></path></symbol>'), this.addDock({
      config: {
        position: "RightTop",
        size: { width: 300, height: 0 },
        icon: "iconComment",
        title: this.isMobile ? "AI助手" : `AI助手(${this.name})`,
        hotkey: "⌥⌘A"
      },
      data: {
        plugin: this
      },
      type: c,
      init(t) {
        t.element.innerHTML = '<div style="padding: 10px;">AI 助手 UI 占位符</div>', console.log("AI Assistant Dock initialized");
      },
      destroy() {
        console.log("AI Assistant Dock destroyed");
      }
    }), console.log(this.i18n.helloPlugin);
  }
  onunload() {
    console.log("Unloading siyuan-plugin-canvas...");
  }
}
export {
  m as default
};
