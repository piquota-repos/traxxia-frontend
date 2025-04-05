import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

const FormattedContentViewer = ({ value, onChange }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (value) {
      const processedContent = processRawContent(value);
      setContent(processedContent);
    }
  }, [value]);

  const processRawContent = (text) => {
    let processed = text.replace(/\\n/g, '\n');
    processed = processed.replace(/^(\d+)[\.\)]\s+(.+)$/gm, (_, number, content) => `<li>${content}</li>`);
    processed = processed.replace(/(<li>.*?<\/li>)\s*(<li>.*?<\/li>)/gs, "<ol>$1$2</ol>");
    processed = processed.replace(/^[●\*\-•]\s+(.+)$/gm, "<li>$1</li>");
    processed = processed.replace(/(<li>(?!<\/ol>).*?<\/li>)\s*(<li>(?!<\/ol>).*?<\/li>)/gs, "<ul>$1$2</ul>");
    processed = processed.replace(/^(\d+)\.([A-Za-z].+)$/gm, "<h3>$1. $2</h3>");
    processed = processed.replace(/^(?!<[oluh])(.+)$/gm, "<p>$1</p>");
    return DOMPurify.sanitize(processed);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'], // Clear formatting button
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'link', 'image'
  ];

  const handleEditorChange = (content) => {
    setContent(content);
    if (onChange) {
      onChange(content);
    }
  };

  return (
    <div className="content-viewer" style={{ maxWidth: 'auto', margin: '20px auto' }}>
      <ReactQuill
        value={content}
        onChange={handleEditorChange}
        modules={modules}
        formats={formats}
        theme="snow"
      />
    </div>
  );
};

export default FormattedContentViewer;
