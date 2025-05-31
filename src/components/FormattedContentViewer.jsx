import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';

const FormattedContentViewer = ({ value, onChange, placeholder }) => {
  const [content, setContent] = useState('');

  // Process initial and external value changes
  useEffect(() => {
    if (value !== undefined) {
      // If the value contains HTML, extract plain text from it
      const plainText = extractPlainText(value);
      setContent(plainText);
    }
  }, [value]);

  // Extract plain text from HTML content (for backward compatibility)
  const extractPlainText = (htmlContent) => {
    if (!htmlContent) return '';
    
    // If it's already plain text, return as is
    if (!htmlContent.includes('<')) {
      return htmlContent;
    }
    
    // Convert HTML to plain text
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    const textContent = doc.body.textContent || '';
    
    // Process lists and formatting back to simple text format
    return processHtmlToPlainText(htmlContent);
  };

  const processHtmlToPlainText = (html) => {
    if (!html) return '';
    
    let text = html;
    
    // Convert ordered lists back to numbered format
    text = text.replace(/<ol[^>]*>(.*?)<\/ol>/gs, (match, content) => {
      let counter = 1;
      return content.replace(/<li[^>]*>(.*?)<\/li>/gs, (liMatch, liContent) => {
        // Handle nested bullet points
        const cleanContent = liContent.replace(/<ul[^>]*>(.*?)<\/ul>/gs, (ulMatch, ulContent) => {
          const bullets = ulContent.replace(/<li[^>]*>(.*?)<\/li>/gs, '\n* $1');
          return bullets;
        });
        
        // Clean HTML tags and format
        const plainLiContent = cleanContent.replace(/<[^>]*>/g, '').trim();
        return `${counter++}. ${plainLiContent}\n`;
      });
    });
    
    // Convert unordered lists to bullet points
    text = text.replace(/<ul[^>]*>(.*?)<\/ul>/gs, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gs, (liMatch, liContent) => {
        const plainLiContent = liContent.replace(/<[^>]*>/g, '').trim();
        return `* ${plainLiContent}\n`;
      });
    });
    
    // Convert paragraphs to line breaks
    text = text.replace(/<p[^>]*>(.*?)<\/p>/gs, '$1\n');
    
    // Remove remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');
    
    // Clean up extra whitespace
    text = text.replace(/\n{3,}/g, '\n\n').trim();
    
    return text;
  };

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    if (onChange) {
      // Store as plain text
      onChange(newContent);
    }
  };

  const handleKeyDown = (e) => {
    // Allow tab insertion in textarea
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      // Insert tab character
      const newValue = content.substring(0, start) + '\t' + content.substring(end);
      setContent(newValue);
      
      // Set cursor position after the tab
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1;
      }, 0);
      
      if (onChange) {
        onChange(newValue);
      }
    }
  };

  const handlePaste = (e) => {
    // Allow default paste behavior for plain text
    // The content will be processed through handleChange
  };

  return (
    <div className="simple-content-viewer">
      <Form.Control
        as="textarea"
        rows={8}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder || "Enter your response...\n\nYou can use:\n• Bullet points with *\n• Numbered lists with 1., 2., etc.\n• Multiple paragraphs"}
        className="answer-textarea"
        style={{
          resize: 'vertical',
          minHeight: '200px',
          fontSize: '14px',
          lineHeight: '1.6',
          padding: '12px',
          border: '1px solid #ced4da',
          borderRadius: '0.375rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
      />
      
      {/* Optional: Show formatting tips */}
      <small className="text-muted mt-1 d-block">
        <strong>Formatting tips:</strong> Use * for bullet points, 1. 2. 3. for numbered lists
      </small>
    </div>
  );
};

export default FormattedContentViewer;