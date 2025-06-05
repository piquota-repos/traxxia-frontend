import React, { useEffect, useState } from 'react';
import '../styles/dashboard.css';

const PorterMatrix = ({ porterText }) => {
  const [forces, setForces] = useState({
    'Supplier Power': { items: [] },
    'Buyer Power': { items: [] },
    'Competitive Rivalry': { items: [] },
    'Threat of Substitution': { items: [] },
    'Threat of New Entry': { items: [] }
  });

  useEffect(() => {
    if (porterText) {
      const parsedData = parsePorterText(porterText);
      setForces(parsedData);
    }
  }, [porterText]);

  const parsePorterText = (text) => {
    const result = {
      'Supplier Power': { items: [] },
      'Buyer Power': { items: [] },
      'Competitive Rivalry': { items: [] },
      'Threat of Substitution': { items: [] },
      'Threat of New Entry': { items: [] }
    };

    // Enhanced cleaning to handle various conclusion formats and malformed markdown
    let cleanText = text.replace(/\*{2,}\s*Conclusion\s*\*{2,}[\s\S]*$/i, '');
    cleanText = cleanText.replace(/\*\*\s*Conclusion\s*:\s*\*\*[\s\S]*$/i, '');
    cleanText = cleanText.replace(/\*\*Conclusion:\*\*[\s\S]*$/i, '');
    cleanText = cleanText.replace(/In conclusion[\s\S]*$/i, '');
    
    Object.keys(result).forEach(force => {
      // Enhanced pattern that handles malformed markdown and various conclusion formats
      const pattern = new RegExp(
        `\\*\\*\\s*${force}\\s*:\\*\\*([\\s\\S]*?)(?=\\*\\*\\s*(?:${
          Object.keys(result).filter(f => f !== force).join('|')
        })\\s*:\\*\\*|\\*{2,}\\s*Conclusion\\s*\\*{2,}|\\*\\*\\s*Conclusion\\s*:\\s*\\*\\*|\\*\\*Conclusion:\\*\\*|\\*\\*Actionable Recommendations:\\*\\*|In conclusion|Conclusion:|$)`,
        'i'
      );

      const match = pattern.exec(cleanText);
      
      if (match) {
        let content = match[1].trim();
        
        // More aggressive cleanup for conclusion text that might have leaked in
        content = content.replace(/\*{2,}\s*Conclusion\s*\*{2,}[\s\S]*$/i, '');
        content = content.replace(/\*\*\s*Conclusion\s*:\s*\*\*[\s\S]*$/i, '');
        content = content.replace(/\*\*Conclusion:\*\*[\s\S]*$/i, '');
        content = content.replace(/Conclusion:[\s\S]*$/i, '');
        content = content.replace(/In conclusion[\s\S]*$/i, '');
        content = content.replace(/To succeed in this environment[\s\S]*$/i, '');
        content = content.replace(/By following these recommendations[\s\S]*$/i, '');
        content = content.replace(/To stay competitive[\s\S]*$/i, '');
        
        // Handle case where conclusion appears immediately after the content with malformed markdown
        const conclusionIndex = content.toLowerCase().search(/\*{0,}\s*conclusion/i);
        if (conclusionIndex > -1 && conclusionIndex < content.length - 15) {
          content = content.substring(0, conclusionIndex).trim();
        }
        
        // Remove trailing asterisks that might be left over from malformed markdown
        content = content.replace(/\*+\s*$/, '').trim();
        
        const firstParagraphEnd = content.indexOf('\n\n');
        const summary = firstParagraphEnd > -1 
          ? content.substring(0, firstParagraphEnd).trim() 
          : content.trim();
        
        let items = [];
        if (firstParagraphEnd > -1) {
          const restOfContent = content.substring(firstParagraphEnd).trim();
          items = restOfContent
            .split(/\n+/)
            .map(line => line.replace(/^[\s•\-\d.]+/, '').trim())
            .filter(item => item.length > 0 && 
                    !item.toLowerCase().startsWith('in conclusion') &&
                    !item.toLowerCase().includes('conclusion'));
        }

        result[force] = { summary, items };
      }
    });

    return result;
  };

  const getConclusionText = () => {
    if (!porterText) return "";
    
    // Look for conclusion section with multiple pattern variations, including malformed markdown
    const conclusionPatterns = [
      // Match malformed markdown like ****Conclusion** **
      /\*{2,}\s*Conclusion\s*\*{2,}\s*([\s\S]*?)(?=\*\*Actionable Recommendations:\*\*|Actionable Recommendations:|$)/i,
      // Match **Conclusion:** with or without extra spaces/formatting
      /\*\*\s*Conclusion\s*:\s*\*\*\s*([\s\S]*?)(?=\*\*Actionable Recommendations:\*\*|Actionable Recommendations:|$)/i,
      /\*\*Conclusion:\*\*\s*([\s\S]*?)(?=\*\*Actionable Recommendations:\*\*|Actionable Recommendations:|$)/i,
      // Match "Conclusion:" without markdown formatting
      /Conclusion:\s*([\s\S]*?)(?=\*\*Actionable Recommendations:\*\*|Actionable Recommendations:|$)/i,
      // Match "In conclusion" patterns
      /In conclusion[,:]\s*([\s\S]*?)(?=\*\*Actionable Recommendations:\*\*|Actionable Recommendations:|$)/i,
      // Match just **Conclusion** without colon
      /\*\*\s*Conclusion\s*\*\*\s*([\s\S]*?)(?=\*\*Actionable Recommendations:\*\*|Actionable Recommendations:|$)/i
    ];
    
    for (const pattern of conclusionPatterns) {
      const match = pattern.exec(porterText);
      if (match) {
        let conclusion = match[1] || match[0];
        
        // Clean up the conclusion text - handle various malformed markdown patterns
        conclusion = conclusion.replace(/^\*{2,}\s*Conclusion\s*\*{2,}\s*/i, '');
        conclusion = conclusion.replace(/^\*\*\s*Conclusion\s*:\s*\*\*\s*/i, '');
        conclusion = conclusion.replace(/^\*\*Conclusion:\*\*\s*/i, '');
        conclusion = conclusion.replace(/^\*\*\s*Conclusion\s*\*\*\s*/i, '');
        conclusion = conclusion.replace(/^Conclusion:\s*/i, '');
        conclusion = conclusion.replace(/^In conclusion[,:]\s*/i, '');
        conclusion = conclusion.replace(/\*\*Actionable Recommendations:\*\*[\s\S]*$/i, '');
        conclusion = conclusion.replace(/Actionable Recommendations:[\s\S]*$/i, '');
        
        // Remove any leading/trailing asterisks that might be left over
        conclusion = conclusion.replace(/^\*+\s*/, '').replace(/\s*\*+$/, '');
        
        return conclusion.trim();
      }
    }
    
    return "";
  };

  const getActionableRecommendations = () => {
    if (!porterText) return "";
    
    const actionablePattern = /\*\*Actionable Recommendations:\*\*([\s\S]*?)$/i;
    const match = actionablePattern.exec(porterText);
    
    if (match) {
      return match[1].trim();
    }
    
    return "";
  };

  return (
    <div className="porter-container">
      <h4 className="text-center mb-4"><strong>Porter's Five Forces Analysis</strong></h4>

      <div className="porter-forces">
        <div className="force top">
          Threat of New Entry
          <br />
          <span>{forces['Threat of New Entry'].summary}</span>
          {forces['Threat of New Entry'].items.map((item, i) => (
            <div key={`entry-${i}`} className="analysis-box">{item}</div>
          ))}
        </div>

        <div className="force left">
          Supplier Power
          <br />
          <span>{forces['Supplier Power'].summary}</span>
          {forces['Supplier Power'].items.map((item, i) => (
            <div key={`supplier-${i}`} className="analysis-box">{item}</div>
          ))}
        </div>

        <div className="force center">
          Competitive Rivalry
          <br />
          <span>{forces['Competitive Rivalry'].summary}</span>
          {forces['Competitive Rivalry'].items.map((item, i) => (
            <div key={`rivalry-${i}`} className="analysis-box">{item}</div>
          ))}
        </div>

        <div className="force right">
          Buyer Power
          <br />
          <span>{forces['Buyer Power'].summary}</span>
          {forces['Buyer Power'].items.map((item, i) => (
            <div key={`buyer-${i}`} className="analysis-box">{item}</div>
          ))}
        </div>

        <div className="force bottom">
          Threat of Substitution
          <br />
          <span>{forces['Threat of Substitution'].summary}</span>
          {forces['Threat of Substitution'].items.map((item, i) => (
            <div key={`sub-${i}`} className="analysis-box">{item}</div>
          ))}
        </div>
      </div>

      {/* Separate Conclusion Section */}
      {getConclusionText() && (
        <div className="mt-4 conclusion-section">
          <h5><strong>Conclusion</strong></h5>
          <div className="conclusion-text">
            <div dangerouslySetInnerHTML={{ 
              __html: getConclusionText().replace(/\n/g, "<br/>") 
            }} />
          </div>
        </div>
      )}

      {/* Actionable Recommendations Section */}
      {getActionableRecommendations() && (
        <div className="mt-4 recommendations-section">
          <h5><strong>Actionable Recommendations</strong></h5>
          <div className="recommendations-text">
            <div dangerouslySetInnerHTML={{ 
              __html: getActionableRecommendations().replace(/\n/g, "<br/>") 
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PorterMatrix;