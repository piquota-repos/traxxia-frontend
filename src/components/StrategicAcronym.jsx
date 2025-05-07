import React from 'react';
import analysisConfig from '../utils/analysisConfig.json';

// Helper function to extract strategic items from analysis text
export const extractStrategicItems = (strategicContent) => {
  if (!strategicContent) {
    console.log('No strategic content provided');
    return [];
  }
  
  // Use the strategic regex pattern from the shared config
  const strategicRegex = new RegExp(analysisConfig.shared.regex.strategic, 'i');
  const match = strategicRegex.exec(strategicContent);
  
  if (!match) {
    console.log('No STRATEGIC section found in the content');
    return [];
  }
  
  const content = match[1].trim();
  console.log('Found STRATEGIC content:', content.substring(0, 100) + '...');
  
  // Split by line, preserving the original structure
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const parsedItems = [];
  
  // Try multiple regex patterns to account for different formatting styles
  const regexPatterns = [
    // Standard format: S - Strategic: description
    /^\s*\*?\s*([A-Z])\s*-\s*(?:\*\*([^:*]+)\*\*:?\s*|\*([^:*]+)\*:?\s*|([^:*]+):?\s*|)(.+)/i,
    
    // Alternative format: S - description (no keyword)
    /^\s*\*?\s*([A-Z])\s*-\s*(.+)/i,
    
    // Bullet point format: * S - Keyword: description
    /^\s*[\*•-]\s*([A-Z])\s*-\s*(?:\*\*([^:*]+)\*\*:?\s*|\*([^:*]+)\*:?\s*|([^:*]+):?\s*|)(.+)/i
  ];
  
  lines.forEach(line => {
    let matched = false;
    
    // Try each pattern until one matches
    for (const pattern of regexPatterns) {
      const match = line.trim().match(pattern);
      if (match) {
        const acronym = match[1].toUpperCase();
        
        // For the first pattern with keyword and description
        if (match.length >= 5) {
          const keyword = (match[2] || match[3] || match[4] || '').trim();
          const description = match[5] ? match[5].trim() : '';
          parsedItems.push({ acronym, keyword, description });
        } 
        // For simpler pattern with just acronym and description
        else if (match.length >= 3) {
          const keyword = '';
          const description = match[2].trim();
          parsedItems.push({ acronym, keyword, description });
        }
        
        matched = true;
        break;
      }
    }
    
    // If none of the patterns matched but line starts with a letter that could be part of STRATEGIC
    if (!matched && /^\s*\*?\s*([STRATEGIC])\s*[-:]/i.test(line)) {
      console.log('Potential unmatched STRATEGIC line:', line);
    }
  });
  
  console.log(`Parsed ${parsedItems.length} STRATEGIC items`);
  parsedItems.forEach(item => {
    console.log(`${item.acronym} - ${item.keyword}: ${item.description.substring(0, 30)}...`);
  });
  
  // Define the fixed STRATEGIC acronym sequence
  const acronymSequence = ['S', 'T', 'R', 'A', 'T', 'E', 'G', 'I', 'C'];
  
  // Track usage of each acronym letter (to support duplicates like 'T')
  const letterUsage = {};
  
  const result = acronymSequence.map(letter => {
    const usedCount = letterUsage[letter] || 0;
    const matches = parsedItems.filter(item => item.acronym === letter);
    const match = matches[usedCount] || null;
    
    letterUsage[letter] = usedCount + 1;
    return match;
  });
  
  return result;
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
  
  if (!strategicItems || strategicItems.length === 0) return null;
  
  const acronymLetters = ['S', 'T', 'R', 'A', 'T', 'E', 'G', 'I', 'C'];
  
  // Debugging
  console.log('Strategic Items Extracted:', strategicItems);
  
  return (
    <>
      <h5 className="mt-4 mb-3"><strong>STRATEGIC Acronym</strong></h5>
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
                        {item.keyword && <strong>{item.keyword}:</strong>} {item.description}
                      </div>
                    ) : (
                      <div className="text-muted">No data available</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default StrategicAcronym;