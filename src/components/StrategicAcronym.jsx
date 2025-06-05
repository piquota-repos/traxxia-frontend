import React from 'react';

// Helper function to extract strategic items from analysis text
export const extractStrategicItems = (strategicContent) => {
  if (!strategicContent) return [];

  const acronymSequence = ['S', 'T', 'R', 'A', 'T', 'E', 'G', 'I', 'C'];
  const parsedItems = [];

  // Enhanced regex patterns to match various formats
  acronymSequence.forEach(letter => {
    // Try multiple patterns to match different formatting styles
    const patterns = [
      // Pattern 1: **S = Strategy: Description**
      new RegExp(`\\*\\*${letter}\\s*=\\s*([^*]+?)\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*[STRATEGIC]\\s*=|\\*\\*Conclusion|In conclusion|$)`, 'i'),
      // Pattern 2: S = Strategy: Description (without bold)
      new RegExp(`${letter}\\s*=\\s*([^\\n]+?)\\n([\\s\\S]*?)(?=[STRATEGIC]\\s*=|Conclusion|In conclusion|$)`, 'i'),
      // Pattern 3: **S** = Strategy: Description
      new RegExp(`\\*\\*${letter}\\*\\*\\s*=\\s*([^\\n]+?)\\n([\\s\\S]*?)(?=\\*\\*[STRATEGIC]|[STRATEGIC]\\s*=|Conclusion|In conclusion|$)`, 'i'),
      // Pattern 4: S: Strategy - Description
      new RegExp(`${letter}\\s*:\\s*([^\\n]+?)\\n([\\s\\S]*?)(?=[STRATEGIC]\\s*:|Conclusion|In conclusion|$)`, 'i')
    ];

    let match = null;
    for (const pattern of patterns) {
      match = pattern.exec(strategicContent);
      if (match) break;
    }
    
    if (match) {
      const fullTitle = match[1].trim();
      let content = match[2].trim();
      
      // Extract keyword from title (everything before the colon)
      const titleParts = fullTitle.split(':');
      const keyword = titleParts[0].trim();
      
      // If there's a description after the colon in the title, use that
      let description = '';
      if (titleParts.length > 1) {
        description = titleParts.slice(1).join(':').trim();
      }
      
      // Extract bullet points and other content from content
      const bulletPoints = [];
      const lines = content.split('\n').filter(line => line.trim() !== '');
      
      let theoryText = '';
      let exampleText = '';
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        // Match bullet points (starting with * or -)
        if (trimmedLine.match(/^[\*\-]\s+/)) {
          const bulletText = trimmedLine.replace(/^[\*\-]\s+/, '').trim();
          bulletPoints.push(bulletText);
        }
        // Extract theory and example sections
        else if (trimmedLine.toLowerCase().startsWith('* theory:')) {
          theoryText = trimmedLine.replace(/^\*\s*theory:\s*/i, '').trim();
        }
        else if (trimmedLine.toLowerCase().startsWith('* example:')) {
          exampleText = trimmedLine.replace(/^\*\s*example:\s*/i, '').trim();
        }
      });
      
      // Store the parsed information
      parsedItems.push({ 
        acronym: letter, 
        keyword, 
        description,
        bulletPoints: bulletPoints.length > 0 ? bulletPoints : null,
        theory: theoryText,
        example: exampleText,
        fullContent: content
      });
    } else {
      // If no pattern matches, try to find the letter mentioned anywhere
      const fallbackPattern = new RegExp(`${letter}\\s*[=:]\\s*([^\\n]+)`, 'i');
      const fallbackMatch = fallbackPattern.exec(strategicContent);
      
      if (fallbackMatch) {
        parsedItems.push({
          acronym: letter,
          keyword: fallbackMatch[1].trim(),
          description: '',
          bulletPoints: null,
          theory: '',
          example: '',
          fullContent: fallbackMatch[1].trim()
        });
      } else {
        parsedItems.push(null);
      }
    }
  });

  return parsedItems;
};

// Helper function to get conclusion from strategic analysis
export const getStrategicConclusion = (strategicContent) => {
  if (!strategicContent) return "";
  
  const conclusionPatterns = [
    /\*{2,}\s*Conclusion\s*\*{2,}\s*([\s\S]*?)(?=\*\*Actionable Recommendations:\*\*|$)/i,
    /\*\*\s*Conclusion\s*:\s*\*\*\s*([\s\S]*?)(?=\*\*Actionable Recommendations:\*\*|$)/i,
    /\*\*Conclusion:\*\*\s*([\s\S]*?)(?=\*\*Actionable Recommendations:\*\*|$)/i,
    /In conclusion[,:]\s*([\s\S]*?)(?=\*\*Actionable Recommendations:\*\*|$)/i
  ];
  
  for (const pattern of conclusionPatterns) {
    const match = pattern.exec(strategicContent);
    if (match) {
      let conclusion = match[1] || match[0];
      conclusion = conclusion.replace(/^\*+\s*/, '').replace(/\s*\*+$/, '');
      return conclusion.trim();
    }
  }
  
  return "";
};

// Define the style classes for STRATEGIC table columns
const STRATEGIC_COLUMN_STYLES = [
  'political-bg',    // S - red
  'economic-bg',     // T - blue
  'social-bg',       // R - purple
  'technological-bg', // A - orange
  'legal-bg',        // T - green
  'environmental-bg', // E - yellow
  'strengths-bg',    // G - red
  'weaknesses-bg',   // I - blue
  'opportunities-bg' // C - purple
];

const StrategicAcronym = ({ analysisResult }) => {
  const strategicItems = extractStrategicItems(analysisResult);
  const conclusion = getStrategicConclusion(analysisResult);
  
  // Debug logging
  console.log('Strategic Analysis Result:', analysisResult);
  console.log('Extracted Strategic Items:', strategicItems);
  
  if (!strategicItems || strategicItems.length === 0 || strategicItems.every(item => item === null)) {
    return (
      <div className="alert alert-info">
        <p><strong>Debug Information:</strong></p>
        <p>No STRATEGIC items found in the analysis result.</p>
        <details>
          <summary>Raw Analysis Text (first 500 chars)</summary>
          <pre style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
            {analysisResult ? analysisResult.substring(0, 500) + '...' : 'No content'}
          </pre>
        </details>
      </div>
    );
  }

  const acronymLetters = ['S', 'T', 'R', 'A', 'T', 'E', 'G', 'I', 'C'];

  return (
    <>
      <h5 className="mt-4 mb-3"><strong>STRATEGIC Analysis</strong></h5>
      <div className="table-responsive mb-4">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th width="10%" className="text-center">Letter</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {acronymLetters.map((letter, index) => {
              const item = strategicItems[index];
              const styleClass = STRATEGIC_COLUMN_STYLES[index];
              
              return (
                <tr key={`${letter}-${index}`}>
                  <td className="text-center align-middle">
                    <strong>{letter}</strong>
                  </td>
                  <td className="p-2">
                    {item ? (
                      <div className={`strategic-item ${styleClass}`}>
                        <strong>{item.keyword}:</strong> {item.description}
                        
                        {/* Display theory if available */}
                        {item.theory && (
                          <div className="mt-2">
                            <strong>Theory:</strong> {item.theory}
                          </div>
                        )}
                        
                        {/* Display example if available */}
                        {item.example && (
                          <div className="mt-2">
                            <strong>Example:</strong> {item.example}
                          </div>
                        )}
                        
                        {/* Display bullet points if available */}
                        {item.bulletPoints && (
                          <div className="mt-2">
                            <strong>Key actions:</strong>
                            <ul className="mb-0 mt-1">
                              {item.bulletPoints.map((bullet, bulletIndex) => (
                                <li key={bulletIndex} className="mb-1">{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Fallback: display full content if no specific parts found */}
                        {!item.theory && !item.example && !item.bulletPoints && item.fullContent && (
                          <div className="mt-2">
                            <div dangerouslySetInnerHTML={{ 
                              __html: item.fullContent.replace(/\n/g, "<br/>") 
                            }} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-muted">No data available for {letter}</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Display conclusion if available */}
      {conclusion && (
        <div className="mt-4 conclusion-section">
          <h5><strong>Conclusion</strong></h5>
          <div className="conclusion-text">
            <div dangerouslySetInnerHTML={{ 
              __html: conclusion.replace(/\n/g, "<br/>") 
            }} />
          </div>
        </div>
      )}
    </>
  );
};

export default StrategicAcronym;