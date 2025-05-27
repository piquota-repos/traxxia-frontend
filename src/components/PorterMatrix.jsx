import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css';
import StrategicAcronym from './StrategicAcronym';

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

    Object.keys(result).forEach(force => {
      const pattern = new RegExp(
        `\\*\\*\\s*${force}\\s*:\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*\\s*(?:${
          Object.keys(result).join('|')
        }|STRATEGIC Acronym)\\s*:\\*\\*|$)`,
        'i'
      );

      const match = pattern.exec(text);
      
      if (match) {
        const content = match[1].trim();
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
            .filter(item => item.length > 0);
        }

        result[force] = { summary, items };
      }
    });

    return result;
  };

  const getConclusionText = () => {
    if (!porterText) return "";
    const conclusionRegex = /By following (?:the STRATEGIC acronym|these (?:recommendations|actionable items))[\s\S]*?$/i;
    const conclusionMatch = conclusionRegex.exec(porterText);
    return conclusionMatch ? conclusionMatch[0] : "";
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

      {/*<StrategicAcronym analysisResult={porterText} />*/}

      {getConclusionText() && (
        <div className="mt-3 conclusion-text">{getConclusionText()}</div>
      )}
    </div>
  );
};

export default PorterMatrix;
