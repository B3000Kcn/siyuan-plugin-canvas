# AI 助手插件开发备忘录

本文档总结了在开发 Siyuan AI 助手插件（siyuan-plugin-canvas）过程中的关键步骤、遇到的问题和有效的解决方案。

## 1. 获取当前文档 ID (`currentDocId`)

*   **目标:** 让 AI 助手知道用户当前正在查看哪个文档。
*   **遇到的问题:**
    *   `loaded-protyle-dynamic` 事件监听器在某些环境下触发不稳定或不触发。
    *   `onLayoutReady` 事件触发时，DOM 可能未完全准备好，难以直接获取活动编辑器的 ID，即使加延时也不可靠。
*   **最终方案:**
    *   在 `src/index.ts` 的 `onload` 方法中，使用 `this.eventBus.on('switch-protyle', this.handleSwitchProtyle)` 监听用户切换文档标签页的事件。
    *   在 `handleSwitchProtyle` 回调函数中，从事件 `detail.protyle.block.rootID` 中安全地提取文档 ID。
    *   创建一个 Svelte store (`currentDocumentIdStore` 或类似名称) 在 `src/stores.ts` 中。
    *   在 `handleSwitchProtyle` 中更新这个 store (`currentDocumentIdStore.set(docId)`)。
    *   在 `src/components/AIChatPanel.svelte` 中订阅 (`currentDocumentIdStore.subscribe(...)`) 这个 store 来获取最新的文档 ID。

## 2. 获取当前文档内容 (上下文)

*   **目标:** 将当前打开文档的 Markdown 内容发送给 AI 作为上下文信息。
*   **遇到的问题与尝试:**
    *   `/api/filetree/getDoc`：虽然看起来很合适，但在测试中返回了 `{ code: 0, data: null }`，无法获取内容。
    *   `/api/query/sql` (`SELECT markdown FROM blocks WHERE id = ? AND type = 'd'`)：查询成功但返回空结果，表明文档块 (`type = 'd'`) 本身不直接存储所有子块组合的 Markdown。
    *   `/api/block/getBlockMarkdown`：针对文档块 ID 调用时，返回 `200 OK` 但响应体为空 (`response.text()` 为空字符串)，不适用于获取文档的完整内容。
*   **最终方案:**
    *   在 `AIChatPanel.svelte` 的 `getDocumentContext` 函数中，确认 `currentDocId` 存在后，调用 **`/api/export/exportMdContent`** API。
    *   使用标准 `fetch` (而不是 `fetchSyncPost`，后者在处理空响应或非 JSON 响应时可能出错且不易调试) 发送 POST 请求，body 为 `JSON.stringify({ id: currentDocId })`。
    *   **关键调试步骤:** 务必先用 `response.text()` 读取原始响应文本并打印到控制台，再检查 `response.ok` 状态。如果响应正常且文本非空，再尝试 `JSON.parse()`。
    *   该 API 成功时返回 `{ code: 0, data: { content: "完整的 Markdown 内容..." } }` 结构。从 `data.content` 中提取 Markdown。
*   **集成:** 在 `sendMessage` 函数中调用 `getDocumentContext`，并将获取到的 `documentContext` 添加到发送给 AI 的 `system` prompt 中，明确告知 AI 这是上下文。

## 3. UI 渲染与 Svelte 反应性

*   **问题:** 聊天消息列表不更新，或者只有部分消息显示。
*   **解决方案:**
    *   **唯一 Key:** 在 Svelte 的 `#each` 循环中，必须为每个列表项提供一个稳定且唯一的 key。给每个消息对象添加一个唯一的 `id` 属性（例如时间戳+随机数），并在循环中使用 `{#each $messages as message (message.id)}`。
    *   **强制更新数组/对象 Store:** 当修改 Svelte store 中存储的数组或对象时（例如 `push` 到数组），Svelte 可能无法检测到变化。需要在修改后显式调用 `store.set([...get(store)])` 或 `store.update(arr => [...arr])` 来创建一个新的数组引用，从而触发更新。
    *   **条件渲染:** 使用 `{#if message.role === 'user'}` 和 `{:else if message.role === 'assistant'}` 等条件块来为不同类型的消息应用不同的 HTML 结构和 CSS 类（例如 `.message.user`, `.message.ai`）。
    *   **HTML 渲染:** AI 返回的内容通常包含 Markdown。需要一个 `markdownToHtml` 工具函数将其转换为 HTML，并在模板中使用 Svelte 的 `{@html ...}` 标签来渲染，例如 `{@html message.html}`。

## 4. API 调用与设置

*   **问题:** 调用外部 AI API (如 DeepSeek) 失败。例如返回 400 Bad Request (模型不存在) 或 422 Unprocessable Content。
*   **解决方案:**
    *   **配置准确:** 确保从设置 (`settingsStore`) 中正确读取了 API Key (`apiKey`) 和模型名称 (`modelName`)，并在调用 `fetchChatCompletion` 时传递这些参数。检查参数名是否与 API 要求一致。
    *   **请求体格式:** 仔细检查发送给 AI API 的 `messages` 数组结构是否符合其要求（例如，包含 `system`, `user`, `assistant` 角色，`content` 为字符串）。
    *   **错误处理:** 在 `fetchChatCompletion` 和调用它的地方（如 `sendMessage`）使用 `try...catch` 块。在 `catch` 中详细记录错误信息 (`console.error`)，并考虑在 UI 上向用户显示友好的错误提示。

## 5. 调试流程与技巧

*   **高频使用 `console.log`:** 这是最有效的调试手段。在关键步骤打印变量值、函数入口/出口、API 请求参数、API **原始**响应文本、解析后的数据等。
*   **浏览器开发者工具:**
    *   **Console:** 查看所有 `console.log` 输出和 JavaScript 错误。
    *   **Network:** 检查 API 请求的 URL、方法、请求头、请求体、响应状态码、响应头、**响应体预览和原始文本**。这是排查 API 问题的利器。
    *   **Elements:** 检查生成的 HTML 结构和应用的 CSS 样式是否符合预期。
*   **构建 -> 复制 -> 重启:** 这是思源插件开发的标准流程。
    *   运行 `pnpm build` (或 `npm run build`)。
    *   **完全关闭** Siyuan 应用程序（确保后台进程也已退出）。
    *   将 `dist` 目录下的所有文件**覆盖**到 `WORKSPACE/data/plugins/你的插件名/` 目录下。
    *   重新启动 Siyuan。
    *   **关键:** 一定要确保 Siyuan 完全重启，否则可能加载的是缓存的旧代码。
*   **代码警告:** 注意区分构建时的 Warnings (如 `Unused CSS selector`) 和 Errors。Warnings 通常不影响运行，但最好也处理掉。
