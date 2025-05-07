import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css';
import StrategicAcronym from './StrategicAcronym';
import analysisConfig from '../utils/analysisConfig.json';

const PorterMatrix = ({ porterText }) => {
  // Access the Porter configuration
  const porterConfig = analysisConfig.porter;
  
  // Initialize state with forces from the config file
  const [forces, setForces] = useState(() => {
    const initialForces = {};
    porterConfig.forces.forEach(force => {
      initialForces[force] = { items: [] };
    });
    return initialForces;
  });

  useEffect(() => {
    if (porterText) {
      const parsedData = parsePorterText(porterText);
      setForces(parsedData);
    }
  }, [porterText]);

  const parsePorterText = (text) => {
    // Initialize result with forces from the config file
    const result = {};
    porterConfig.forces.forEach(force => {
      result[force] = { items: [] };
    });

    // Create a regex pattern with all forces from the config
    const forcesPattern = porterConfig.forces.join('|');
    
    // Parse each force
    Object.keys(result).forEach(force => {
      const pattern = new RegExp(
        `\\*\\*\\s*${force}\\s*:\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*\\s*(?:${forcesPattern}|STRATEGIC Acronym)\\s*:\\*\\*|$)`,
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
    const conclusionRegex = new RegExp(analysisConfig.shared.regex.conclusion, 'i');
    const conclusionMatch = conclusionRegex.exec(porterText);
    return conclusionMatch ? conclusionMatch[0] : "";
  };

  // Create a force component for each position
  const renderForce = (force, position) => {
    const key = force.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className={`force ${position}`} key={key}>
        {force}
        <br />
        <span>{forces[force].summary}</span>
        {forces[force].items.map((item, i) => (
          <div key={`${key}-${i}`} className="analysis-box">{item}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="porter-container">
      <h4 className="text-center mb-4"><strong>{porterConfig.title}</strong></h4>

      <div className="porter-forces">
        {Object.entries(porterConfig.layout).map(([force, position]) => 
          renderForce(force, position)
        )}
      </div>

      <StrategicAcronym analysisResult={porterText} />

      {getConclusionText() && (
        <div className="mt-3 conclusion-text">{getConclusionText()}</div>
      )}
    </div>
  );
};

export default PorterMatrix;