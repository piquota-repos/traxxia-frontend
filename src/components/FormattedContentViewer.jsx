import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

const FormattedContentViewer = ({ value, onChange }) => {
  const [content, setContent] = useState('');
  const isInitialMount = useRef(true);
  const quillRef = useRef(null);
  const skipNextUpdate = useRef(false);
  const isPasting = useRef(false);

  // Process initial and external value changes
  useEffect(() => {
    if (value && (!skipNextUpdate.current || isInitialMount.current)) {
      const processedContent = processRawContent(value);
      setContent(processedContent);
      isInitialMount.current = false;
    }
    skipNextUpdate.current = false;
  }, [value]);

  // Set up paste event handling
  useEffect(() => {
    if (!quillRef.current) return;
    
    const quill = quillRef.current.getEditor();
    
    const handlePaste = (e) => {
      // Prevent the default paste behavior
      e.preventDefault();
      
      isPasting.current = true;
      
      // Get clipboard data as plain text
      const clipboardData = e.clipboardData || window.clipboardData;
      const pastedText = clipboardData.getData('text/plain');
      
      try {
        // Process the pasted text
        const processedContent = processRawContent(pastedText);
        
        // Save current selection
        const range = quill.getSelection();
        const index = range ? range.index : 0;
        
        // Insert the processed content at cursor position
        quill.clipboard.dangerouslyPasteHTML(index, processedContent);
        
        // Update state and notify parent
        setContent(quill.root.innerHTML);
        if (onChange) {
          skipNextUpdate.current = true;
          onChange(quill.root.innerHTML);
        }
      } catch (error) {
        console.error("Error processing paste:", error);
        // Fall back to default paste behavior if our processing fails
        quill.clipboard.dangerouslyPasteHTML(quill.getSelection().index, pastedText);
      } finally {
        setTimeout(() => {
          isPasting.current = false;
        }, 10);
      }
    };
    
    // Add event listener for paste
    quill.root.addEventListener('paste', handlePaste);
    
    return () => {
      if (quill && quill.root) {
        quill.root.removeEventListener('paste', handlePaste);
      }
    };
  }, []);

  const processRawContent = (text) => {
    if (!text) return '';
    
    // Normalize line breaks
    let processed = text.replace(/\\n/g, '\n');
    const lines = processed.split('\n');
    let html = [];
    let listItems = [];
    let currentBulletPoints = [];
    let inNumberedList = false;
    
    for (let line of lines) {
      line = line.trim();
      if (!line) continue; // Skip empty lines
      
      // Match lines starting with "1." followed by bold text with actual numbers
      const numberedItemMatch = line.match(/^1\.\s*\*\*(\d+)\.\s*(.+)\*\*$/);
      // Match bullet points
      const bulletMatch = line.match(/^\*\s*(.+)$/);
      
      if (numberedItemMatch) {
        // If we were collecting bullet points, add them to the previous list item
        if (currentBulletPoints.length > 0 && listItems.length > 0) {
          listItems[listItems.length - 1] += `<ul>${currentBulletPoints.join('')}</ul>`;
          currentBulletPoints = [];
        }
        
        if (!inNumberedList) {
          inNumberedList = true;
          listItems = [];
        }
        
        const [, num, content] = numberedItemMatch;
        // Use the correct number from the bold text
        listItems.push(`<li><strong>${num}. ${content}</strong></li>`);
        
      } else if (bulletMatch) {
        const [, content] = bulletMatch;
        currentBulletPoints.push(`<li>${content}</li>`);
        
      } else {
        // If it's a paragraph after the last list
        if (inNumberedList) {
          // Add any remaining bullet points to the last list item
          if (currentBulletPoints.length > 0 && listItems.length > 0) {
            listItems[listItems.length - 1] += `<ul>${currentBulletPoints.join('')}</ul>`;
            currentBulletPoints = [];
          }
          
          html.push('<ol>');
          html = html.concat(listItems);
          html.push('</ol>');
          inNumberedList = false;
        }
        
        html.push(`<p>${line}</p>`);
      }
    }
    
    // Close the list if it's still open at the end
    if (inNumberedList) {
      // Add any remaining bullet points to the last list item
      if (currentBulletPoints.length > 0 && listItems.length > 0) {
        listItems[listItems.length - 1] += `<ul>${currentBulletPoints.join('')}</ul>`;
      }
      
      html.push('<ol>');
      html = html.concat(listItems);
      html.push('</ol>');
    }
    
    return DOMPurify.sanitize(html.join(''));
  };
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'link', 'image'
  ];

  const handleEditorChange = (newContent) => {
    if (!isPasting.current) {
      setContent(newContent);
      if (onChange) {
        skipNextUpdate.current = true;
        onChange(newContent);
      }
    }
  };

  return (
    <div className="content-viewer" style={{ maxWidth: 'auto', margin: '20px auto' }}>
      <ReactQuill
        ref={quillRef}
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