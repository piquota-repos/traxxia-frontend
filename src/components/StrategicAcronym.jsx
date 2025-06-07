// StrategicAcronym.jsx - Fixed Version for Spanish Response Format
import React from 'react';
import { detectLanguage } from '../utils/translations';

const StrategicAcronym = ({ analysisResult }) => {
  const lang = detectLanguage(analysisResult);
  
  // Hard-coded safe translations - no object dependencies
  const getTranslation = (key) => {
    const translations = {
      en: {
        title: 'STRATEGIC Analysis',
        conclusion: 'Conclusion',
        noData: 'No data available for',
        keyActions: 'Key actions:',
        theory: 'Theory:',
        example: 'Example:',
        recommendations: 'Specific Recommendations'
      },
      es: {
        title: 'Análisis ESTRATÉGICO',
        conclusion: 'Conclusión',
        noData: 'Sin datos disponibles para',
        keyActions: 'Acciones clave:',
        theory: 'Teoría:',
        example: 'Ejemplo:',
        recommendations: 'Recomendaciones Específicas'
      }
    };
    
    const langTranslations = translations[lang] || translations['en'];
    return langTranslations[key] || key;
  };
  
  const strategicItems = extractStrategicItems(analysisResult, lang);
  const conclusion = getStrategicConclusion(analysisResult, lang);
  const recommendations = getRecommendations(analysisResult, lang);
  
  // Debug logging
  console.log('Strategic Analysis Result:', analysisResult);
  console.log('Extracted Strategic Items:', strategicItems);
  console.log('Language detected:', lang);
  
  if (!strategicItems || strategicItems.length === 0 || strategicItems.every(item => item === null)) {
    return (
      <div className="alert alert-info">
        <p><strong>Debug Information:</strong></p>
        <p>No STRATEGIC items found in the analysis result.</p>
        <p>Language detected: {lang}</p>
        <details>
          <summary>Raw Analysis Text (first 1000 chars)</summary>
          <pre style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
            {analysisResult ? String(analysisResult).substring(0, 1000) + '...' : 'No content'}
          </pre>
        </details>
      </div>
    );
  }

  const acronymLetters = lang === 'es' ? 
    ['E', 'S', 'T', 'R', 'A', 'T', 'É', 'G', 'I', 'C', 'O'] : 
    ['S', 'T', 'R', 'A', 'T', 'E', 'G', 'I', 'C'];

  return (
    <>
      <h5 className="mt-4 mb-3">
        <strong>{getTranslation('title')}</strong>
      </h5>
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
              const styleClass = STRATEGIC_COLUMN_STYLES[index] || 'neutral-bg';
              
              return (
                <tr key={`${letter}-${index}`}>
                  <td className="text-center align-middle">
                    <strong>{String(letter)}</strong>
                  </td>
                  <td className="p-2">
                    {item ? (
                      <div className={`strategic-item ${styleClass}`}>
                        {item.keyword && (
                          <div className="mb-2">
                            <strong>{String(item.keyword)}:</strong> {String(item.description || '')}
                          </div>
                        )}
                        
                        {/* Display main content */}
                        {item.content && (
                          <div className="mb-2">
                            <div dangerouslySetInnerHTML={{ 
                              __html: String(item.content).replace(/\n/g, "<br/>") 
                            }} />
                          </div>
                        )}
                        
                        {/* Display theory if available */}
                        {item.theory && (
                          <div className="mt-2">
                            <strong>{getTranslation('theory')}</strong> {String(item.theory)}
                          </div>
                        )}
                        
                        {/* Display example if available */}
                        {item.example && (
                          <div className="mt-2">
                            <strong>{getTranslation('example')}</strong> {String(item.example)}
                          </div>
                        )}
                        
                        {/* Display bullet points if available */}
                        {item.bulletPoints && Array.isArray(item.bulletPoints) && item.bulletPoints.length > 0 && (
                          <div className="mt-2">
                            <strong>{getTranslation('keyActions')}</strong>
                            <ul className="mb-0 mt-1">
                              {item.bulletPoints.map((bullet, bulletIndex) => (
                                <li key={bulletIndex} className="mb-1">{String(bullet)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-muted">
                        {getTranslation('noData')} {String(letter)}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Display recommendations if available */}
      {recommendations && (
        <div className="mt-4 recommendations-section">
          <h5><strong>{getTranslation('recommendations')}</strong></h5>
          <div className="recommendations-text">
            <div dangerouslySetInnerHTML={{ 
              __html: String(recommendations).replace(/\n/g, "<br/>") 
            }} />
          </div>
        </div>
      )}
      
      {/* Display conclusion if available */}
      {conclusion && (
        <div className="mt-4 conclusion-section">
          <h5><strong>{getTranslation('conclusion')}</strong></h5>
          <div className="conclusion-text">
            <div dangerouslySetInnerHTML={{ 
              __html: String(conclusion).replace(/\n/g, "<br/>") 
            }} />
          </div>
        </div>
      )}
    </>
  );
};

// Helper function to extract strategic items from analysis text
const extractStrategicItems = (strategicContent, lang) => {
  if (!strategicContent) return [];

  const acronymSequence = lang === 'es' ? 
    ['E', 'S', 'T', 'R', 'A', 'T', 'É', 'G', 'I', 'C', 'O'] : 
    ['S', 'T', 'R', 'A', 'T', 'E', 'G', 'I', 'C'];
    
  const parsedItems = [];

  // For Spanish ESTRATÉGICO analysis, we need different letter mappings
  const spanishMapping = {
    'E': 'Estrategia',      // Strategy
    'S': 'Situación',       // Situation (mapped to T - Tactics)
    'T': 'Tácticas',        // Tactics
    'R': 'Recursos',        // Resources
    'A': 'Análisis',        // Analysis
    'T2': 'Tecnología',     // Technology (second T)
    'É': 'Ejecución',       // Execution
    'G': 'Gobernanza',      // Governance
    'I': 'Innovación',      // Innovation
    'C': 'Cultura',         // Culture
    'O': 'Organización'     // Organization
  };

  const englishMapping = {
    'S': 'Strategy',
    'T': 'Tactics',
    'R': 'Resources',
    'A': 'Analysis',
    'T2': 'Technology',
    'E': 'Execution',
    'G': 'Governance',
    'I': 'Innovation',
    'C': 'Culture'
  };

  // Enhanced extraction for the actual format in your response
  acronymSequence.forEach((letter, index) => {
    let searchLetter = letter;
    let searchTerm = '';
    
    if (lang === 'es') {
      // Handle the special case of two T's in ESTRATÉGICO
      if (letter === 'T' && index === 2) {
        searchTerm = 'Tácticas';
      } else if (letter === 'T' && index === 5) {
        searchTerm = 'Tecnología';
        searchLetter = 'T';
      } else {
        searchTerm = spanishMapping[letter] || letter;
      }
    } else {
      // Handle the special case of two T's in STRATEGIC
      if (letter === 'T' && index === 1) {
        searchTerm = 'Tactics';
      } else if (letter === 'T' && index === 4) {
        searchTerm = 'Technology';
      } else {
        searchTerm = englishMapping[letter] || letter;
      }
    }

    // Try multiple patterns to match the actual format in your response
    const patterns = [
      // Pattern 1: **S - Estrategia: Definir una visión clara, misión y objetivos**
      new RegExp(`\\*\\*${searchLetter}\\s*-\\s*${searchTerm}:\\s*([^*]+?)\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*[${acronymSequence.join('')}]\\s*-|\\*\\*Recomendaciones|\\*\\*Conclusion|$)`, 'i'),
      
      // Pattern 2: **S - Strategy: Description**
      new RegExp(`\\*\\*${searchLetter}\\s*-\\s*([^*]+?)\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*[${acronymSequence.join('')}]\\s*-|\\*\\*Recomendaciones|\\*\\*Conclusion|$)`, 'i'),
      
      // Pattern 3: S = Strategy: Description
      new RegExp(`${searchLetter}\\s*=\\s*([^\\n]+?)\\n([\\s\\S]*?)(?=[${acronymSequence.join('')}]\\s*=|Recomendaciones|Conclusion|$)`, 'i'),
      
      // Pattern 4: Search by full term
      new RegExp(`\\*\\*.*?${searchTerm}.*?\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*.*?(?:${Object.values(lang === 'es' ? spanishMapping : englishMapping).join('|')})|\\*\\*Recomendaciones|\\*\\*Conclusion|$)`, 'i')
    ];

    let match = null;
    let matchedPattern = -1;
    
    for (let i = 0; i < patterns.length; i++) {
      match = patterns[i].exec(strategicContent);
      if (match) {
        matchedPattern = i;
        break;
      }
    }
    
    if (match) {
      let keyword = '';
      let content = '';
      
      if (matchedPattern === 0) {
        // Pattern 1: **S - Estrategia: Description**
        keyword = searchTerm;
        content = String(match[2] || '').trim();
      } else if (matchedPattern === 1) {
        // Pattern 2: **S - Strategy: Description**
        const fullTitle = String(match[1] || '').trim();
        const titleParts = fullTitle.split(':');
        keyword = String(titleParts[0] || '').trim();
        content = String(match[2] || '').trim();
      } else {
        // Other patterns
        keyword = String(match[1] || '').trim();
        content = String(match[2] || '').trim();
      }
      
      // Clean up content
      content = content
        .replace(/^\*+\s*/, '')
        .replace(/\s*\*+$/, '')
        .trim();
      
      // Extract description from keyword if it contains a colon
      let description = '';
      if (keyword.includes(':')) {
        const keywordParts = keyword.split(':');
        keyword = keywordParts[0].trim();
        description = keywordParts.slice(1).join(':').trim();
      }
      
      // Store the parsed information
      parsedItems.push({ 
        acronym: searchLetter, 
        keyword: keyword || searchTerm, 
        description: description,
        content: content,
        bulletPoints: null,
        theory: '',
        example: ''
      });
    } else {
      // Fallback: search for any mention of the term
      const fallbackPattern = new RegExp(`${searchTerm}[\\s\\S]{0,200}`, 'i');
      const fallbackMatch = fallbackPattern.exec(strategicContent);
      
      if (fallbackMatch) {
        parsedItems.push({
          acronym: searchLetter,
          keyword: searchTerm,
          description: '',
          content: String(fallbackMatch[0] || '').trim(),
          bulletPoints: null,
          theory: '',
          example: ''
        });
      } else {
        parsedItems.push(null);
      }
    }
  });

  return parsedItems;
};

// Helper function to get conclusion from strategic analysis
const getStrategicConclusion = (strategicContent, lang) => {
  if (!strategicContent) return "";
  
  const conclusionPatterns = [
    // Spanish patterns
    /\*\*Conclusión\*\*\s*([\s\S]*?)$/i,
    /En resumen[,:]\s*([\s\S]*?)$/i,
    /Conclusión\s*([\s\S]*?)$/i,
    // English patterns
    /\*\*Conclusion\*\*\s*([\s\S]*?)$/i,
    /In conclusion[,:]\s*([\s\S]*?)$/i,
    /Conclusion\s*([\s\S]*?)$/i
  ];
  
  for (const pattern of conclusionPatterns) {
    const match = pattern.exec(strategicContent);
    if (match) {
      let conclusion = String(match[1] || '').trim();
      conclusion = conclusion.replace(/^\*+\s*/, '').replace(/\s*\*+$/, '');
      
      // Remove recommendations section if it's included
      conclusion = conclusion.replace(/\*\*Recomendaciones[\s\S]*$/i, '');
      conclusion = conclusion.replace(/\*\*Recommendations[\s\S]*$/i, '');
      
      if (conclusion.length > 20) {
        return conclusion.trim();
      }
    }
  }
  
  return "";
};

// Helper function to get recommendations
const getRecommendations = (strategicContent, lang) => {
  if (!strategicContent) return "";
  
  const recommendationPatterns = [
    // Spanish patterns
    /\*\*Recomendaciones específicas\*\*\s*([\s\S]*?)(?=\*\*Conclusión|$)/i,
    /Recomendaciones específicas[:\s]*([\s\S]*?)(?=\*\*Conclusión|$)/i,
    // English patterns
    /\*\*Specific Recommendations\*\*\s*([\s\S]*?)(?=\*\*Conclusion|$)/i,
    /Specific Recommendations[:\s]*([\s\S]*?)(?=\*\*Conclusion|$)/i
  ];
  
  for (const pattern of recommendationPatterns) {
    const match = pattern.exec(strategicContent);
    if (match) {
      let recommendations = String(match[1] || '').trim();
      recommendations = recommendations.replace(/^\*+\s*/, '').replace(/\s*\*+$/, '');
      
      if (recommendations.length > 20) {
        return recommendations.trim();
      }
    }
  }
  
  return "";
};

// Define the style classes for STRATEGIC table columns
const STRATEGIC_COLUMN_STYLES = [
  'political-bg',      // E - red
  'economic-bg',       // S - blue
  'social-bg',         // T - purple
  'technological-bg',  // R - orange
  'legal-bg',          // A - green
  'environmental-bg',  // T - yellow
  'strengths-bg',      // É - red
  'weaknesses-bg',     // G - blue
  'opportunities-bg',  // I - purple
  'threats-bg',        // C - gray
  'neutral-bg'         // O - light gray
];

export default StrategicAcronym;