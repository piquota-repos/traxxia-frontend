import React from 'react';

// Helper function to extract strategic items from analysis text
export const extractStrategicItems = (strategicContent) => {
  if (!strategicContent) return [];

  const acronymSequence = ['S', 'T', 'R', 'A', 'T', 'E', 'G', 'I', 'C'];
  const parsedItems = [];

  // Updated regex patterns to match the new GROQ response format
  acronymSequence.forEach(letter => {
    // Match patterns like: **S = Strategy: Description**
    const pattern = new RegExp(`\\*\\*${letter}\\s*=\\s*([^*]+?)\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*[STRATEGIC]\\s*=|In conclusion|$)`, 'i');
    const match = pattern.exec(strategicContent);
    
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
      
      // Extract bullet points from content
      const bulletPoints = [];
      const lines = content.split('\n').filter(line => line.trim() !== '');
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        // Match bullet points (starting with * or -)
        if (trimmedLine.match(/^[\*\-]\s+/)) {
          const bulletText = trimmedLine.replace(/^[\*\-]\s+/, '').trim();
          bulletPoints.push(bulletText);
        }
      });
      
      // Store the bullet points separately for better rendering
      parsedItems.push({ 
        acronym: letter, 
        keyword, 
        description,
        bulletPoints: bulletPoints.length > 0 ? bulletPoints : null
      });
    } else {
      parsedItems.push(null);
    }
  });

  return parsedItems;
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
  
  if (!strategicItems || strategicItems.length === 0 || strategicItems.every(item => item === null)) {
    return null;
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