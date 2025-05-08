import React from 'react';

// Helper function to extract strategic items from analysis text
export const extractStrategicItems = (strategicContent) => {
  if (!strategicContent) return [];

  const acronymSequence = ['S', 'T', 'R', 'A', 'T', 'E', 'G', 'I', 'C'];
  const strategicRegex = /\*\*\s*STRATEGIC Acronym\s*:\*\*([\s\S]*?)(?=\*\*\s*(Areas for Improvement|Next Steps|Recommendations|By following)\s*:|$)/i;
  const match = strategicRegex.exec(strategicContent);
  
  if (!match) return [];
  
  const content = match[1].trim();
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const parsedItems = [];

  // Match lines that start with a letter + dash format
  const regex = /^\*?\s*\*?\*?([A-Z])\*?\*?\s*-\s*(?:\*\*([^:*]+)\*\*|([^:*]+))?:?\s*(.*)/i;

  lines.forEach(line => {
    const match = line.trim().match(regex);
    if (match) {
      const acronym = match[1].toUpperCase();
      const keyword = (match[2] || match[3] || '').trim();
      const description = match[4].trim();
      parsedItems.push({ acronym, keyword, description });
    }
  });

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
                    ) : ""}
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