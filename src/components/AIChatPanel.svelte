<script lang="ts">
  import { onMount, tick } from 'svelte'; // 导入 onMount 和 tick
  import { settingsStore, conversationsStore, currentDocumentIdStore, currentDocumentPathStore, type AppSettings, type SavedConversation, type ChatMessage } from '../stores'; // <-- 导入 store 和类型
  import { onDestroy } from 'svelte'; // 需要 onDestroy 来取消订阅
  import { fetchChatCompletion } from '../utils/api';
  import { markdownToHtml } from '../utils/markdown'; // 引入 markdown 转换函数
  import { writable, get } from 'svelte/store'; // 引入 get
  import { fetchSyncPost } from 'siyuan'; // Import fetchSyncPost for SQL query

  // Define constants
  const MAX_HISTORY_MESSAGES = 20; // Maximum number of messages (user + assistant) to keep in history for context
  const STORAGE_KEY_MESSAGES = 'aiAssistantMessages';

  // --- Props --- 
  export let pluginData: { saveConversations: (conversations: SavedConversation[]) => Promise<void> };

  // 消息类型定义
  interface ChatMessage {
    id: number; // 用于 #each key
    sender: 'user' | 'ai' | 'error'; // 添加 error 类型
    text: string;
    isLoading?: boolean; // AI 消息加载状态
  }

  // --- 状态变量 --- 
  // 为组件内的消息对象添加可选的 html 属性
  type DisplayChatMessage = {
    id: string; // Add unique ID for keying
    role: 'system' | 'user' | 'assistant';
    content: string;
    html?: string; // Optional pre-rendered HTML for assistant messages
  };
  let messages = writable<DisplayChatMessage[]>([]);
  let userInput = '';
  let chatHistoryElement: HTMLElement; // 用于绑定聊天记录 div
  let nextId = 1; // 用于生成消息 ID
  let isLoading = false; // 添加加载状态
  let currentSettings: AppSettings; // 用于存储从 store 获取的设置
  let savedConversations: SavedConversation[] = []; // 从 store 获取的已保存对话列表
  let currentConversationId: string | null = null; // 当前对话的 ID，null 表示新对话
  let currentDocId: string | null = null; // 新增：存储当前文档 ID
  let currentDocPath: string | null = null; // Add state for path
  let errorMessage = '';

  // 订阅 store
  const settingsUnsubscribe = settingsStore.subscribe(value => {
      currentSettings = value;
  });
  const conversationsUnsubscribe = conversationsStore.subscribe(value => {
      savedConversations = value.sort((a, b) => b.timestamp - a.timestamp); // 按时间倒序
  });
  const currentDocIdUnsubscribe = currentDocumentIdStore.subscribe(value => {
      currentDocId = value;
      // 可选：在此处添加 UI 提示，告知用户当前上下文文档已更改
      // console.log("AIChatPanel aware of currentDocId:", currentDocId);
  });
  const currentDocPathUnsubscribe = currentDocumentPathStore.subscribe(value => {
    currentDocPath = value;
  });
  // 注意：在 Svelte 组件的 <script> 顶层订阅 store 会自动处理取消订阅
  // 如果在 onMount 或其他函数内部订阅，需要在 onDestroy 中取消订阅

  // Component mounted
  onMount(async () => {
      // Add initial assistant message
      const initialText = '有什么可以帮您？';
      messages.set([{ 
          id: Date.now().toString() + 'init', // Give it an ID
          role: 'assistant', 
          content: initialText, 
          html: markdownToHtml(initialText) 
      }]);
      
      loadConversationsFromStorage(); // Placeholder
      await tick(); // Wait for initial message render
      scrollToBottom();
  });

  onDestroy(() => {
      settingsUnsubscribe(); // 取消订阅
      conversationsUnsubscribe();
      currentDocIdUnsubscribe(); // <-- 取消订阅文档 ID
      currentDocPathUnsubscribe();
  });

  // --- 对话管理函数 --- 
  // 开始新对话
  async function newConversation() {
      if (get(messages).length > 1 && !currentConversationId && !isLoading) {
          console.log("Auto-saving previous conversation...");
          await saveCurrentConversation();
      }
      const initialText = '新对话已开始，有什么可以帮您？';
      const initialHtml = markdownToHtml(initialText); 
      messages.update(currentMessages => [...currentMessages, { role: 'assistant', content: initialText, html: initialHtml }]);
      currentConversationId = null;
      nextId = 1;
      userInput = '';
      await tick(); 
      scrollToBottom(); 
  }

  // 保存当前对话
  async function saveCurrentConversation() {
      if (isLoading || get(messages).length <= 1 || currentConversationId) return; 
      const timestamp = Date.now();
      const newId = timestamp.toString();
      const name = `对话 ${new Date(timestamp).toLocaleString()}`;
      const conversationToSave: SavedConversation = {
          id: newId,
          name: name,
          timestamp: timestamp,
          // 只保存原始消息结构 (id, sender, text)
          messages: get(messages)
              .filter(m => m.role === 'user' || m.role === 'assistant')
              .map(({ role, content }) => ({ role, content }))
      };
      const updatedConversations = [conversationToSave, ...savedConversations];
      await pluginData.saveConversations(updatedConversations); 
      currentConversationId = newId; 
      console.log("Conversation saved with ID:", newId);
  }

  // 加载指定 ID 的对话
  function loadConversation(id: string) {
      const conversationToLoad = savedConversations.find(c => c.id === id);
      if (conversationToLoad) {
          messages.update(currentMessages => conversationToLoad.messages.map((msg, index) => ({
              ...msg,
              id: index, // 重新生成 ID
              // 为 AI 消息生成 HTML
              html: msg.role === 'assistant' ? markdownToHtml(msg.content) : undefined
          })));
          currentConversationId = conversationToLoad.id;
          nextId = get(messages).length;
          userInput = '';
          tick().then(scrollToBottom);
          console.log("Conversation loaded:", id);
      }
  }

  // 删除指定 ID 的对话
  async function deleteConversation(id: string, event: MouseEvent) {
      event.stopPropagation(); // 阻止事件冒泡触发展开/加载
      if (confirm('确定要删除这个对话吗？')) {
          const updatedConversations = savedConversations.filter(c => c.id !== id);
          await pluginData.saveConversations(updatedConversations);
          // 如果删除的是当前对话，则开启新对话
          if (currentConversationId === id) {
              newConversation();
          }
          console.log("Conversation deleted:", id);
      }
  }

  // 发送消息函数
  async function sendMessage() {
    if (!userInput.trim() || isLoading) return; // Prevent sending empty or during loading

    errorMessage = '';
    isLoading = true;
    
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const userMessage: DisplayChatMessage = { id: uniqueId, role: 'user', content: userInput.trim() };
    
    messages.update(currentMessages => [...currentMessages, userMessage]);
    messages.set([...get(messages)]); 
    console.log("User message added to store:", get(messages));
    
    const currentUserInput = userInput.trim(); // Store user input before clearing
    userInput = '';
    await tick();
    scrollToBottom();

    // --- Context Fetching --- 
    let documentContext = '';
    if (currentDocId) { // Only fetch if we have a doc ID
        try {
            console.log(`Attempting to fetch context for document ID: ${currentDocId}`);
            documentContext = await getDocumentContext();
            console.log("Fetched document context length:", documentContext?.length ?? 0);
        } catch (err) {
            console.error("Error fetching document context:", err);
            errorMessage = `获取文档上下文失败: ${err.message}`; 
            // Optionally add an error message to the chat?
        }
    } else {
        console.log("No currentDocId, skipping context fetch.");
    }
    // --- Context Fetching End ---

    const conversationHistory = get(messages);
    const historyForApi = conversationHistory
        .filter(msg => msg.role === 'user' || msg.role === 'assistant') 
        .slice(-MAX_HISTORY_MESSAGES) 
        .map(msg => ({              
            role: msg.role,         
            content: msg.content
        }));

    // Modify system prompt to include context if available
    let systemPrompt = "You are a helpful AI assistant integrated into Siyuan Note.";
    if (documentContext) {
        systemPrompt += `\n\nCurrent document context:\n---\n${documentContext}\n---"`;
    }
    // Add user's current query to the final message list *after* potentially adding context
    const finalMessagesForApi = [
        { role: 'system', content: systemPrompt },
        ...historyForApi // History already includes the latest user message
    ];

    console.log("Messages being sent to API (final format):", finalMessagesForApi);

    try {
        // Pass settings to fetchChatCompletion
        const assistantResponseContent = await fetchChatCompletion(finalMessagesForApi, currentSettings);
        
        const assistantId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        // Create assistant message with unique ID
        const assistantMessage: DisplayChatMessage = { 
            id: assistantId, 
            role: 'assistant', 
            content: assistantResponseContent, 
            html: markdownToHtml(assistantResponseContent)
        }; 
        messages.update(currentMessages => [...currentMessages, assistantMessage]);
        messages.set([...get(messages)]); // Force reactivity update
        console.log("Assistant message added to store:", get(messages)); // Log after update

        // saveMessagesToStorage(); // Assuming this uses role/content

    } catch (error) {
        console.error('Error fetching chat completion:', error);
        errorMessage = `AI 请求失败: ${error.message}`;
        const errorId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        // Create error message with unique ID
        const errorResponseMessage: DisplayChatMessage = { 
            id: errorId, 
            role: 'assistant', // Display as AI message? Or a new 'error' role?
            content: `抱歉，请求出错: ${errorMessage}`, 
            html: markdownToHtml(`抱歉，请求出错: ${errorMessage}`) 
        }; 
        messages.update(currentMessages => [...currentMessages, errorResponseMessage]);
        messages.set([...get(messages)]); // Force reactivity update
        console.log("Error message added to store:", get(messages)); // Log after update
    } finally {
        isLoading = false;
        await tick(); // Wait for UI update before scrolling
        scrollToBottom(); 
    }
  }

  // 滚动到底部函数
  function scrollToBottom() {
    if (chatHistoryElement) {
      // Use requestAnimationFrame for smoother scrolling after DOM updates
      requestAnimationFrame(() => {
        chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
      });
    }
  }

  // Rewrite getDocumentContext to use exportMdContent API
  async function getDocumentContext(): Promise<string> {
    if (!currentDocId) {
        console.log("getDocumentContext called without currentDocId");
        return '';
    }

    console.log(`Using /api/export/exportMdContent with ID: ${currentDocId}`);
    try {
        const response = await fetch("/api/export/exportMdContent", { // Changed API endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: currentDocId }) // Pass the document ID
        });

        const responseText = await response.text(); 
        console.log(`Raw response from /api/export/exportMdContent (Status: ${response.status}):`, responseText);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${responseText}`);
        }
        
        if (!responseText) {
             console.log("exportMdContent API returned an empty response body.");
             return '';
        }

        try {
            const data = JSON.parse(responseText);
            
            if (data.code !== 0) {
                 throw new Error(`API returned error code ${data.code}: ${data.msg}`);
             }

            // Expecting { code: 0, data: { content: "markdown..." } } based on typical export APIs
            if (data.data && data.data.content) { 
                console.log("exportMdContent API successful, parsed JSON, returning content.");
                return data.data.content; // Return the markdown content
            } else {
                console.log("exportMdContent API returned success code, but no data.content found. Response data:", data.data);
                return '';
            }
        } catch (parseError) {
             console.error("Failed to parse response from exportMdContent as JSON:", parseError);
             throw new Error(`Failed to parse API response: ${parseError.message}`);
        }

    } catch (error) {
        console.error("Error fetching or processing content via exportMdContent:", error);
        errorMessage = `获取文档上下文时出错: ${error.message}`;
        return '';
    }
  }

  function saveMessagesToStorage() {
    // Placeholder - Implement saving using role/content
    console.log("Saving messages (ensure format is correct)...");
    // localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(get(messages)));
  }

  function loadConversationsFromStorage() {
    // Placeholder - Implement loading and map to role/content if needed
    console.log("Loading messages (ensure format is correct)...");
    // const storedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
    // if (storedMessages) {
    //     messages.set(JSON.parse(storedMessages).map(m => ({...m, html: m.role === 'assistant' ? markdownToHtml(m.content) : undefined })));
    // }
  }

</script>

<div class="ai-chat-panel">
  <!-- 添加对话管理 UI -->
  <div class="conversation-controls">
      <button class="b3-button" on:click={newConversation}>新建对话</button>
      
      {#if get(messages).length > 1 && !currentConversationId && !isLoading}
          <button class="b3-button b3-button--outline" on:click={saveCurrentConversation}>保存当前对话</button>
      {/if}
      
      <select class="b3-select" on:change={(e) => loadConversation(e.currentTarget.value)} title="加载历史对话">
          <option value="" disabled selected>加载历史对话</option>
          {#each savedConversations as conv (conv.id)}
              <option value={conv.id}>{conv.name}</option>
          {/each}
      </select>
       {#if currentConversationId}
        <button 
            class="b3-button b3-button--error" 
            title="删除当前对话"
            on:click={(e) => deleteConversation(currentConversationId, e)} >
            删除当前
        </button>
       {/if}
  </div>

  <div class="chat-history" bind:this={chatHistoryElement}> 
    {#each $messages as message (message.id)} 
        {#if message.role === 'user'}
            <div class="message user">
                <div>{@html message.content.replace(/\n/g, '<br/>')}</div> 
            </div>
        {:else if message.role === 'assistant'}
            <div class="message ai">
                {@html message.html || message.content} 
            </div>
        {/if} 
    {/each}
    {#if isLoading}
        <div class="message ai loading">
            <p>AI 正在思考...</p> 
        </div>
    {/if}
  </div>

  <div class="input-area">
    <textarea 
      bind:value={userInput} 
      placeholder="在此输入您的问题或指令..."
      rows="3"
      on:keydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
      disabled={isLoading}
    ></textarea>
    <button on:click={sendMessage} disabled={!userInput.trim() || isLoading}>发送</button>
  </div>
</div>

<style>
  /* 使用 flex 布局让输入区域固定在底部 */
  .ai-chat-panel {
    display: flex;
    flex-direction: column;
    height: 100%; /* 确保面板占满 Dock 高度 */
    font-family: sans-serif;
    padding: 5px; /* 稍微减少内边距 */
    box-sizing: border-box; /* 防止 padding 导致溢出 */
  }

  .chat-history {
    flex-grow: 1; /* 占据剩余空间 */
    overflow-y: auto; /* 内容多时可滚动 */
    border: 1px solid #eee;
    margin-bottom: 5px;
    padding: 8px;
    display: flex; /* 添加 flex 布局 */
    flex-direction: column; /* 消息垂直排列 */
  }

  /* 消息气泡基础样式 */
  .message {
      max-width: 80%;
      margin-bottom: 10px;
      padding: 8px 12px;
      border-radius: 15px;
      word-wrap: break-word;
      line-height: 1.4;
  }

  /* 用户消息样式 */
  .message.user {
      background-color: var(--b3-theme-primary-light); /* 思源主题浅色 */
      color: var(--b3-theme-primary-darker); /* 思源主题深色 */
      align-self: flex-end; /* 用户消息靠右 */
      border-bottom-right-radius: 5px;
  }

  /* AI 消息样式 */
  .message.ai {
      background-color: #f0f0f0; /* 浅灰色背景 */
      color: #333;
      align-self: flex-start; /* AI 消息靠左 */
      border-bottom-left-radius: 5px;
  }

  .message p {
      margin: 0;
  }

  .input-area {
    display: flex;
    align-items: center; /* 垂直居中对齐输入框和按钮 */
  }

  textarea {
    flex-grow: 1; /* 输入框占据大部分宽度 */
    resize: none; /* 禁止调整大小 */
    margin-right: 5px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
  }

  button {
    padding: 5px 10px;
    cursor: pointer;
    background-color: var(--b3-theme-primary); /* 使用思源主题色 */
    color: white;
    border: none;
    border-radius: 3px;
  }
  
  button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
  }

  button:hover:not(:disabled) {
      opacity: 0.8;
  }

  /* 错误消息样式 */
  .message.error {
      background-color: #ffdddd; /* 淡红色背景 */
      color: #d8000c; /* 深红色文字 */
      align-self: stretch; /* 错误消息占满宽度 */
      text-align: center;
      border: 1px solid #d8000c;
  }

  /* AI 加载中样式 */
  .message.ai.loading p {
      font-style: italic;
      color: #666;
      /* 可以添加动画效果 */
      animation: blink 1.5s infinite ease-in-out;
  }
  
  @keyframes blink {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
  }

  .conversation-controls {
      display: flex;
      gap: 5px;
      padding: 5px 0;
      border-bottom: 1px solid #eee;
      margin-bottom: 5px;
      flex-wrap: wrap; /* 换行 */
  }
  .conversation-controls select {
      flex-grow: 1; /* 下拉菜单占据剩余空间 */
      min-width: 100px; /* 避免太窄 */
  }

  /* 添加 Lute 生成的 HTML 的一些基本样式 */
  .message.ai :global(h1),
  .message.ai :global(h2),
  .message.ai :global(h3),
  .message.ai :global(h4),
  .message.ai :global(h5),
  .message.ai :global(h6) {
    margin-top: 0.8em;
    margin-bottom: 0.4em;
    line-height: 1.3;
  }
  .message.ai :global(p) {
      margin-bottom: 0.5em; 
      /* 移除默认 margin，避免与气泡内边距冲突 */
      margin-top: 0; 
  }
  .message.ai :global(ul),
  .message.ai :global(ol) {
      margin-left: 1.5em;
      margin-bottom: 0.5em;
  }
  .message.ai :global(pre) {
      background-color: #f5f5f5; 
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      margin-bottom: 0.5em;
  }
  .message.ai :global(code) {
      font-family: monospace;
      background-color: #f0f0f0;
      padding: 0.2em 0.4em;
      border-radius: 3px;
  }
  .message.ai :global(pre) > :global(code) {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
  }
  .message.ai :global(blockquote) {
      border-left: 3px solid #ccc;
      padding-left: 10px;
      margin-left: 0;
      color: #555;
  }
  .message.ai :global(table) {
      border-collapse: collapse;
      margin-bottom: 1em;
      width: auto;
  }
  .message.ai :global(th),
  .message.ai :global(td) {
      border: 1px solid #ddd;
      padding: 6px 10px;
  }
  .message.ai :global(th) {
      background-color: #f2f2f2;
  }
</style> 