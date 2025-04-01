import { get } from 'svelte/store';
import { settingsStore } from '../stores';

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface ChatCompletionResponse {
    choices: Array<{
        message: {
            content: string;
            role: string;
        };
        finish_reason: string;
    }>;
}

export async function fetchChatCompletion(messages: ChatMessage[]): Promise<string> {
    const settings = get(settingsStore);
    
    if (!settings.apiKey || !settings.apiUrl) {
        throw new Error('API Key 或 API URL 未配置');
    }

    const response = await fetch(settings.apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
            model: settings.modelName || 'deepseek-chat',
            messages: messages,
            temperature: settings.temperature || 0.7,
            max_tokens: settings.maxTokens || 2000
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 请求失败: ${response.status} ${errorText}`);
    }

    const data: ChatCompletionResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
        throw new Error('API 返回数据格式错误');
    }

    return data.choices[0].message.content;
} 