import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownPreview.css';

interface MarkdownPreviewProps {
    content: string;
    fileName?: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, fileName }) => {
    return (
        <div className="markdown-preview">
            <div className="markdown-preview-header">
                <span className="markdown-preview-label">Preview</span>
                {fileName && <span className="markdown-preview-filename">{fileName}</span>}
            </div>
            <div className="markdown-preview-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export default MarkdownPreview;
