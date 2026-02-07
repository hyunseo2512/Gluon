
import React from 'react';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
    content: string;
    onRunCode?: (code: string) => void;
    onApprove?: (toolName: string) => void;
}

/**
 * A lightweight Markdown renderer
 * Handles:
 * - Code blocks (```code```)
 * - Inline code (`code`)
 * - Bold (**text**)
 * - Headers (#, ##, ###)
 * - Unordered lists (- item)
 * - Agent Actions (**Action**)
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onRunCode, onApprove }) => {
    if (!content) return null;

    // DeepSeek R1의 <think>...</think> 태그 제거 (뇌 이모지 포함)
    let cleanedContent = content
        .replace(/<think>[\s\S]*?<\/think>/gi, '')  // <think>...</think> 태그 제거
        .replace(/🧠\s*\(deepseek[^)]*\)/gi, '')    // 🧠 (deepseek...) 패턴 제거
        .replace(/\(deepseek[^)]*\)/gi, '')         // (deepseek...) 패턴 제거
        .trim();

    // Split by code blocks first to avoid parsing markdown inside code blocks
    const parts = cleanedContent.split(/(```[\s\S]*?```)/g);

    return (
        <div className="markdown-content">
            {parts.map((part, index) => {
                // If it's a code block
                if (part.startsWith('```') && part.endsWith('```')) {
                    const match = part.match(/```(\w*)\n([\s\S]*?)```/);
                    if (match) {
                        const language = match[1] || 'text';
                        const code = match[2];
                        return (
                            <div key={index} className="code-block-container">
                                <div className="code-block-header">
                                    <span className="code-language">{language}</span>
                                    <div className="code-block-actions">
                                        {onRunCode && (language.toLowerCase() === 'sh' || language.toLowerCase() === 'bash' || language.toLowerCase() === 'zsh') && (
                                            <button
                                                className="run-button"
                                                onClick={() => onRunCode(code.trim())}
                                                title="Run in Terminal"
                                                style={{ marginRight: '8px' }}
                                            >
                                                ▶ Run
                                            </button>
                                        )}
                                        <button
                                            className="copy-button"
                                            onClick={() => navigator.clipboard.writeText(code)}
                                            title="Copy code"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                                <SyntaxHighlighter
                                    language={language}
                                    style={vscDarkPlus}
                                    customStyle={{
                                        margin: 0,
                                        borderRadius: '0 0 6px 6px',
                                        fontSize: '13px',
                                        fontFamily: "'Fira Code', Consolas, monospace",
                                        backgroundColor: '#1e1e1e', // Match IDE BG
                                    }}
                                    codeTagProps={{
                                        style: { fontFamily: "'Fira Code', Consolas, monospace" }
                                    }}
                                >
                                    {code.replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </div>
                        );
                    }
                    // Fallback for empty or malformed blocks
                    return <pre key={index} className="code-block">{part}</pre>;
                }

                // Parse regular markdown for non-code parts
                return <FormattedText key={index} text={part} onApprove={onApprove} />;
            })}
        </div>
    );
};



const FormattedText: React.FC<{ text: string, onApprove?: (tool: string) => void }> = ({ text, onApprove }) => {
    // Process line by line for headers and lists
    const lines = text.split('\n');
    const renderedLines = lines.map((line, i) => {
        // Headers
        if (line.startsWith('### ')) return <h5 key={i}>{parseInline(line.slice(4))}</h5>;
        if (line.startsWith('## ')) return <h4 key={i}>{parseInline(line.slice(3))}</h4>;
        if (line.startsWith('# ')) return <h3 key={i}>{parseInline(line.slice(2))}</h3>;

        // List items
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
                <div key={i} className="list-item">
                    <span className="list-bullet">•</span>
                    <span>{parseInline(line.trim().slice(2))}</span>
                </div>
            );
        }

        // Agent Action Special Styling
        if (line.includes('**Action**:')) {
            return (
                <div key={i} className="agent-action-line">
                    {parseInline(line)}
                </div>
            )
        }

        // Approval Button
        if (line.includes('[[APPROVE_ACTION:')) {
            const match = line.match(/\[\[APPROVE_ACTION:(.*?)\]\]/);
            if (match) {
                const toolName = match[1];
                return (
                    <div key={i} className="approval-container" style={{ margin: '8px 0', padding: '10px', backgroundColor: 'rgba(64, 224, 208, 0.1)', border: '1px solid rgba(64, 224, 208, 0.3)', borderRadius: '6px' }}>
                        <div style={{ marginBottom: '8px', fontSize: '13px', color: '#40e0d0' }}>Approval Required</div>
                        <div>
                            <button
                                className="approve-button"
                                style={{
                                    backgroundColor: '#40e0d0',
                                    color: '#1e1e1e',
                                    border: 'none',
                                    padding: '6px 16px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                                onClick={() => {
                                    if (onApprove) onApprove(toolName);
                                }}
                            >
                                Accept & Execute
                            </button>
                        </div>
                    </div>
                );
            }
        }

        // Regular paragraph (if empty line, render line break)
        if (line.trim() === '') return <br key={i} />;

        return <div key={i} className="paragraph">{parseInline(line)}</div>;
    });

    return <>{renderedLines}</>;
};

// Helper for inline styles (bold, code, links, images)
const parseInline = (text: string): React.ReactNode[] => {
    // Regex for **bold**, `code`, ![image](url)
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|!\[.*?\]\(.*?\))/g);

    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={index} className="inline-code">{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('![') && part.includes('](') && part.endsWith(')')) {
            const match = part.match(/!\[(.*?)\]\((.*?)\)/);
            if (match) {
                const alt = match[1];
                const src = match[2];
                return (
                    <img
                        key={index}
                        src={src}
                        alt={alt}
                        className="generated-image"
                        style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '10px' }}
                    />
                );
            }
        }
        return part;
    });
};

export default MarkdownRenderer;
