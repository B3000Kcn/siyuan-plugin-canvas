import { Plugin, getFrontend, Dialog } from "siyuan";
import AIChatPanel from "./components/AIChatPanel.svelte";
import SettingsPanel from "./components/SettingsPanel.svelte";
import { settingsStore, conversationsStore, currentDocumentIdStore, currentDocumentPathStore, type AppSettings, type SavedConversation, type DisplayChatMessage } from "./stores";
import { get } from "svelte/store";

const SETTINGS_STORAGE_NAME = "ai-assistant-config";
const CONVERSATIONS_STORAGE_NAME = "ai-assistant-conversations";
const ACTIVE_CONVERSATION_KEY = 'activeUnsavedConversation';
const DEFAULT_SETTINGS: AppSettings = {
    apiUrl: "",
    apiKey: "",
    modelName: "deepseek-chat"
};

// 移除所有常量
const AI_ASSISTANT_DOCK_TYPE = "ai_assistant_dock";

export default class PluginSample extends Plugin {

    private isMobile: boolean; // 保留 isMobile，因为 Dock 标题里用到了
    private settings: AppSettings; // 用于存储当前设置
    private settingsDialog: Dialog | null = null; // 用于跟踪设置对话框
    private conversationsUnsubscribe: () => void;

    // 新增 switch-protyle 的回调引用
    private switchProtyleCallback = this.handleSwitchProtyle.bind(this);

    async onload() {
        console.log("--- siyuan-plugin-canvas onload --- Fired");

        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

        // 加载设置并更新 store
        await this.loadSettings();
        // 加载历史对话
        await this.loadConversations();
        const initialActiveMessages: DisplayChatMessage[] | null = await this.loadData(ACTIVE_CONVERSATION_KEY);
        console.log(`[Index.onload] Loaded initial active messages from ${ACTIVE_CONVERSATION_KEY}:`, JSON.stringify(initialActiveMessages)); // Log the actual data

        this.conversationsUnsubscribe = conversationsStore.subscribe(async (conversations) => {
            if (!conversations || conversations.length === 0 && initialActiveMessages) {
                // Simple check: Don't save if the store is empty right after potentially loading active messages
                // console.log("[Index.storeSubscribe] Skipping initial save of empty conversations list.");
                // return;
            }
            await this.saveData(CONVERSATIONS_STORAGE_NAME, conversations);
            // Reduce log noise, maybe only log on error or less frequently
            // console.log(`Auto-saved conversations list (${conversations.length} total) due to store change.`);
        });
        console.log("Subscribed to conversationsStore for auto-saving.");

        // 新增：监听 'switch-protyle' 事件
        this.eventBus.on("switch-protyle", this.switchProtyleCallback);
        console.log("Event listener for 'switch-protyle' added.");

        // 首次加载时尝试获取当前文档ID (可能需要延迟)
        // setTimeout(() => this.updateCurrentDocIdFromActiveTab(), 500); 
        // ^^^ 上面这行可能不可靠，优先依赖事件

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
                saveData: this.saveData.bind(this),
                loadData: this.loadData.bind(this),
                initialActiveMessages: initialActiveMessages,
                saveConversations: this.saveConversations.bind(this)
            },
            type: AI_ASSISTANT_DOCK_TYPE, 
            init(dock: any) { 
                new AIChatPanel({ 
                    target: dock.element, 
                    props: {
                        pluginData: dock.data, 
                        initialActiveMessages: dock.data.initialActiveMessages 
                    }
                });
                console.log("AI Assistant Dock initialized with Svelte component and required data.");
            },
            destroy() {
                console.log("AI Assistant Dock destroyed");
            }
        });
        console.log("Icons and Dock added.");
    }

    // 新增：在布局准备好后尝试获取初始文档 ID
    onLayoutReady() {
        console.log("--- siyuan-plugin-canvas onLayoutReady --- Fired");
        // 延迟 500ms 执行，等待 DOM 更稳定
        setTimeout(() => {
             console.log("Executing updateCurrentDocIdFromActiveTab after 500ms delay...");
            this.updateCurrentDocIdFromActiveTab();
        }, 500);
    }

    // 新增：处理 'switch-protyle' 事件的回调
    private handleSwitchProtyle({ detail }: any) {
        console.log("--- handleSwitchProtyle --- Fired");
        console.log("Switch Protyle Event detail:", detail);
        if (detail && detail.protyle && detail.protyle.block && detail.protyle.block.rootID) {
            const docId = detail.protyle.block.rootID;
            console.log(`Doc ID found in protyle.block.rootID: ${docId}`);
            currentDocumentIdStore.set(docId);
            console.log(`Current document ID updated via switch-protyle: ${docId}`);

            // Try to get the path
            if (detail.protyle.path) {
                const docPath = detail.protyle.path;
                console.log(`Doc Path found in protyle.path: ${docPath}`);
                currentDocumentPathStore.set(docPath);
                console.log(`Current document Path updated via switch-protyle: ${docPath}`);
            } else {
                console.warn('Doc Path not found in protyle detail.');
                currentDocumentPathStore.set(null); // Clear path if not found
            }

        } else {
            console.warn('Could not find document ID (rootID) in switch-protyle event detail.');
            currentDocumentIdStore.set(null); // Clear ID if not found
            currentDocumentPathStore.set(null); // Clear path if ID not found
        }
    }

    // 尝试从活动标签获取 ID (不再注释掉，作为 onLayoutReady 的实现)
    private updateCurrentDocIdFromActiveTab() {
        console.log("Attempting to get doc ID from active tab...");
        try {
            // 查找当前激活的、可见的 Protyle 编辑器实例
            const activeTab = document.querySelector('.layout__tab--active .protyle:not(.fn__none)');
            if (activeTab) {
                console.log("Active protyle tab element found.");
                // 获取与该 DOM 元素关联的 Protyle 实例
                // 这依赖于 Siyuan 内部实现，可能不稳定
                // 查找具有 protyle 属性的父元素或自身
                let protyleElement = activeTab as HTMLElement | null;
                let protyleInstance = (protyleElement as any)?.protyle;
                while (protyleElement && !protyleInstance) {
                    protyleInstance = (protyleElement as any)?.protyle;
                    protyleElement = protyleElement.parentElement;
                }

                if (protyleInstance?.block?.rootID) {
                    const docId = protyleInstance.block.rootID;
                    currentDocumentIdStore.set(docId);
                    console.log(`Updated doc ID from active tab in onLayoutReady: ${docId}`);
                } else {
                    console.log("Found active protyle tab, but failed to get instance or rootID.", { protyleInstance });
                    // 尝试直接从 data-* 属性获取（不太可靠）
                    const nodeId = activeTab.getAttribute('data-node-id');
                     if (nodeId) {
                         console.log(`Found node-id on active tab: ${nodeId}. Attempting to get root via API.`);
                         // 如果不是文档块，需要调用 API 获取其根 ID
                         // 这会引入异步，并且逻辑更复杂，暂时不实现
                     }
                }
            } else {
                console.log("No active protyle tab element found in onLayoutReady.");
            }
        } catch (e) {
            console.error("Error getting doc ID from active tab:", e);
        }
    }

    // 实现 openSetting 方法
    openSetting(): void {
        // 如果对话框已打开，则不重复打开
        if (this.settingsDialog) {
            return;
        }

        // 创建 Dialog
        this.settingsDialog = new Dialog({
            title: "AI 助手设置",
            content: `<div id="ai-assistant-settings" style="height: 100%;"></div>`, // 容器 div
            width: this.isMobile ? "92vw" : "600px",
            destroyCallback: () => {
                // 关闭对话框时，将 settingsDialog 重置为 null
                this.settingsDialog = null;
                // 注意：Svelte 组件通常会在 target 元素被移除时自动销毁，
                // 但如果需要，可以在这里显式调用 panel.$destroy();
            }
        });

        // 挂载 Svelte 设置组件
        new SettingsPanel({
            target: this.settingsDialog.element.querySelector("#ai-assistant-settings"),
            props: {
                // 传入加载/保存函数和当前设置
                loadSettings: this.loadSettings.bind(this),
                saveSettings: this.saveSettings.bind(this),
                currentSettings: this.settings
            }
        });
    }

    // 修改 loadSettings 以更新 store
    private async loadSettings() {
        const loadedData = await this.loadData(SETTINGS_STORAGE_NAME);
        this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
        settingsStore.set(this.settings);
        console.log("AI Assistant settings loaded and store updated:", this.settings);
        return this.settings; // 返回加载的设置
    }

    // 修改 saveSettings 以更新 store
    private async saveSettings(settings: AppSettings) {
        this.settings = settings;
        await this.saveData(SETTINGS_STORAGE_NAME, this.settings);
        settingsStore.set(this.settings);
        console.log("AI Assistant settings saved and store updated.");
        // TODO: 可能需要通知 AIChatPanel 更新设置
    }

    // 加载对话列表
    private async loadConversations() {
        const loadedConversations: SavedConversation[] = await this.loadData(CONVERSATIONS_STORAGE_NAME) || [];
        conversationsStore.set(loadedConversations); // 更新 store
        console.log(`${loadedConversations.length} conversations loaded.`);
    }

    // 保存对话列表 (整个列表)
    private async saveConversations(conversations: SavedConversation[]) {
        await this.saveData(CONVERSATIONS_STORAGE_NAME, conversations);
        conversationsStore.set(conversations); // 确保 store 同步
        console.log(`Conversations saved via explicit call (${conversations.length} total).`);
    }

    onunload() {
        console.log("--- siyuan-plugin-canvas onunload --- Fired");
        // 移除 'switch-protyle' 监听器
        this.eventBus.off("switch-protyle", this.switchProtyleCallback);
        console.log("Event listener for 'switch-protyle' removed.");
        if (this.conversationsUnsubscribe) {
            this.conversationsUnsubscribe();
            console.log("Unsubscribed from conversationsStore.");
        }
        if (this.settingsDialog) {
            this.settingsDialog.destroy();
        }
    }
}
