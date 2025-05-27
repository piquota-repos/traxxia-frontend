import React, { useMemo } from 'react';
import '../styles/Dashboard.css';
import StrategicAcronym from './StrategicAcronym';

const BCGMatrix = ({ analysisResult }) => {
  const matrixData = useMemo(() => {
    if (!analysisResult) return {
      'Agile Leaders': [],
      'Established Performers': [],
      'Emerging Innovators': [],
      'Strategic Drifters': []
    };

    // These are the quadrant labels we expect from the GROQ API based on the strategic planning book
    const quadrantLabels = [
      'Agile Leaders', // High Growth / High Market Share (Stars equivalent)
      'Established Performers', // Low Growth / High Market Share (Cash Cows equivalent)
      'Emerging Innovators', // High Growth / Low Market Share (Question Marks equivalent)
      'Strategic Drifters' // Low Growth / Low Market Share (Dogs equivalent)
    ];

    const extractedData = {};

    quadrantLabels.forEach(label => {
      // Pattern to match each quadrant section
      // Handles both (High Share / High Growth) format and other potential variants
      const pattern = new RegExp(
        `\\*\\*\\s*${label}\\s*(?:\\(.*?\\))?\\s*:\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*\\s*(?:${quadrantLabels.join('|')
        }|STRATEGIC Acronym)\\s*(?:\\(.*?\\))?\\s*:\\*\\*|$)`,
        'i'
      );

      const match = pattern.exec(analysisResult);

      if (match) {
        const content = match[1].trim();

        // Extract items from bullet points, dashes, or numbered lists
        const items = content
          .split(/\n+/)
          .map(line => line.replace(/^[\s•\-\d.]+/, '').trim())
          .filter(item => item.length > 0);

        extractedData[label] = items;
      } else {
        extractedData[label] = [];
      }
    });

    return extractedData;
  }, [analysisResult]);

  const getConclusionText = () => {
    if (!analysisResult) return "";

    const conclusionRegex = /By following (?:the STRATEGIC acronym|these (?:recommendations|actionable items))[\s\S]*?$/i;
    const conclusionMatch = conclusionRegex.exec(analysisResult);
    return conclusionMatch ? conclusionMatch[0] : "";
  };

  return (
    <div className="bcg-matrix-container">
       <h4 className="text-center mt-4"><strong>BCG Matrix Analysis</strong></h4> 
      <div className="bcg-matrix-template">
        <div className="bcg-matrix-header">
          <div className="matrix-label-y">High</div>
          <div className="matrix-label-center">Market Growth Rate</div>
          <div className="matrix-label-y">Low</div>
        </div>

        <div className="bcg-matrix-grid">
          {/* Agile Leaders (Stars) - Top Left */}
          <div className="bcg-box stars-bg">
            <h6>Agile Leaders</h6>
            <p className="matrix-description">(High Share / High Growth)</p>
            {matrixData['Agile Leaders'].map((item, i) => (
              <div key={`agile-${i}`} className="analysis-box">
                {item}
              </div>
            ))}
          </div>

          {/* Emerging Innovators (Question Marks) - Top Right */}
          <div className="bcg-box question-marks-bg">
            <h6>Emerging Innovators</h6>
            <p className="matrix-description">(Low Share / High Growth)</p>
            {matrixData['Emerging Innovators'].map((item, i) => (
              <div key={`emerging-${i}`} className="analysis-box">
                {item}
              </div>
            ))}
          </div>

          {/* Established Performers (Cash Cows) - Bottom Left */}
          <div className="bcg-box cash-cows-bg">
            <h6>Established Performers</h6>
            <p className="matrix-description">(High Share / Low Growth)</p>
            {matrixData['Established Performers'].map((item, i) => (
              <div key={`established-${i}`} className="analysis-box">
                {item}
              </div>
            ))}
          </div>

          {/* Strategic Drifters (Dogs) - Bottom Right */}
          <div className="bcg-box dogs-bg">
            <h6>Strategic Drifters</h6>
            <p className="matrix-description">(Low Share / Low Growth)</p>
            {matrixData['Strategic Drifters'].map((item, i) => (
              <div key={`drifters-${i}`} className="analysis-box">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="bcg-matrix-footer">
          <div className="matrix-label-x">High</div>
          <div className="matrix-label-center">Relative Market Share</div>
          <div className="matrix-label-x">Low</div>
        </div>
      </div>
      {/* <StrategicAcronym analysisResult={analysisResult} /> */}
      {getConclusionText() && (
        <div className="mt-3 conclusion-text">
          {getConclusionText()}
        </div>
      )}
    </div>
  );
};

export default BCGMatrix;