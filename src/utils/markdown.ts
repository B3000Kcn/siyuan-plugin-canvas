export function markdownToHtml(markdown: string): string {
    // 使用思源内置的 Lute 解析器
    const lute = window.Lute.New();
    return lute.Md2HTML(markdown);
} 