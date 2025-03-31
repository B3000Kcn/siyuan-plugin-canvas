<script lang="ts">
  import { onMount, tick } from 'svelte'; // 导入 onMount 和 tick

  // 消息类型定义
  interface ChatMessage {
    id: number; // 用于 #each key
    sender: 'user' | 'ai' | 'error'; // 添加 error 类型
    text: string;
    isLoading?: boolean; // AI 消息加载状态
  }

  let chatMessages: ChatMessage[] = [
    { id: 0, sender: 'ai', text: '欢迎使用 AI 助手！' } // 初始欢迎消息
  ];
  let userInput = ''; 
  let chatHistoryElement: HTMLElement; // 用于绑定聊天记录 div
  let nextId = 1; // 用于生成消息 ID
  let isLoading = false; // 添加加载状态

  // 发送消息函数
  async function sendMessage() {
    if (!userInput.trim() || isLoading) return; // 正在加载时不允许发送

    const currentUserInput = userInput;
    userInput = ''; // 清空输入
    isLoading = true; // 开始加载

    // 1. 添加用户消息
    chatMessages = [...chatMessages, { id: nextId++, sender: 'user', text: currentUserInput }];
    await tick();
    scrollToBottom();

    // --- 调用 AI API --- 
    try {
      // TODO: 替换为实际的 AI API 调用逻辑
      // 假设我们有一个后端代理 /api/proxy/openai/chat
      // 它需要接收之前的消息历史和当前用户输入
      const requestBody = {
          // 简单起见，只发送最后一条用户消息
          prompt: currentUserInput,
          // 实际应用中可能需要发送更多上下文
          // history: chatMessages.filter(m => m.sender !== 'error') 
      };

      // 模拟 API 调用延迟
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      // --- 模拟成功响应 ---
      const aiResponseText = `这是 AI 对 "${currentUserInput}" 的真实回复。`; 
      chatMessages = [...chatMessages, { id: nextId++, sender: 'ai', text: aiResponseText }];
      // --- 模拟结束 ---

      // 如果实际调用 API:
      /*
      const response = await fetch('/api/proxy/openai/chat', { // 替换为真实 API 端点
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              // 可能需要 Authorization Header (API Key)
          },
          body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
          throw new Error(`API 请求失败: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponseText = data.reply; // 假设返回的数据中有 reply 字段

      chatMessages = [...chatMessages, { id: nextId++, sender: 'ai', text: aiResponseText }];
      */

    } catch (error) {
      console.error("调用 AI API 时出错:", error);
      // 添加错误消息到聊天记录
      chatMessages = [...chatMessages, { 
          id: nextId++, 
          sender: 'error', 
          text: `抱歉，调用 AI 时出错: ${error.message}` 
      }];
    } finally {
        isLoading = false; // 结束加载
        await tick();
        scrollToBottom();
    }
    // --- API 调用结束 ---
  }

  // 滚动到底部函数
  function scrollToBottom() {
    if (chatHistoryElement) {
      chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
    }
  }

  // 组件挂载后滚动到底部
  onMount(() => {
      scrollToBottom();
  });

</script>

<main class="ai-chat-panel">
  <div class="chat-history" bind:this={chatHistoryElement}> 
    {#each chatMessages as message (message.id)} 
      {#if message.sender !== 'error'}
        <div class="message {message.sender}">
          <p>{message.text}</p>
        </div>
      {:else}
        <div class="message error">
          <p>错误: {message.text}</p>
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
      disabled={isLoading} /* 加载时禁用输入框 */
    ></textarea>
    <button on:click={sendMessage} disabled={!userInput.trim() || isLoading}>发送</button>
  </div>
</main>

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
</style> 