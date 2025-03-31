import { Plugin, getFrontend } from "siyuan";
import AIChatPanel from "./components/AIChatPanel.svelte";

// 移除所有常量
const AI_ASSISTANT_DOCK_TYPE = "ai_assistant_dock";

export default class PluginSample extends Plugin {

    private isMobile: boolean; // 保留 isMobile，因为 Dock 标题里用到了

    async onload() {
        console.log("--- siyuan-plugin-canvas (Simplified) Loaded! ---");

        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

        // 重新加入 addIcons
        this.addIcons(`<symbol id="iconComment" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M896 128H128C83.8 128 48 163.8 48 208v448c0 44.2 35.8 80 80 80h176v128l237.6-128H896c44.2 0 80-35.8 80-80V208c0-44.2-35.8-80-80-80z m-48 480H581.8L512 651.7V608H176V256h672v352z" fill="#515151"></path></symbol>`);

        // 重新加入 addDock
        this.addDock({
            config: {
                position: "RightTop",
                size: { width: 300, height: 0 },
                icon: "iconComment", 
                title: this.isMobile ? "AI助手" : `AI助手(${this.name})`,
                hotkey: "⌥⌘A",
            },
            data: { 
                plugin: this,
            },
            type: AI_ASSISTANT_DOCK_TYPE, 
            init(dock: any) { 
                new AIChatPanel({ target: dock.element });
                console.log("AI Assistant Dock initialized with Svelte component");
            },
            destroy() {
                console.log("AI Assistant Dock destroyed");
            }
        });

        // 可以移除最后的 helloPlugin 日志，因为我们已经有 Loaded 日志了
        // console.log(this.i18n.helloPlugin);
    }

    // 可以保留空的 onunload
    onunload() {
        console.log("Unloading siyuan-plugin-canvas...");
    }
}
