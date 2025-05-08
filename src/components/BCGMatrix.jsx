import React, { useMemo } from 'react';
import '../styles/Dashboard.css';
import StrategicAcronym from './StrategicAcronym';
import analysisConfig from '../utils/analysisConfig.json';

const BCGMatrix = ({ analysisResult }) => {
  const bcgConfig = analysisConfig.bcg;

  const matrixData = useMemo(() => {
    if (!analysisResult) {
      const initialData = {};
      bcgConfig.quadrants.forEach(quadrant => {
        initialData[quadrant] = [];
      });
      return initialData;
    }

    const extractedData = {};
    const allQuadrants = bcgConfig.quadrants.join('|');
    
    bcgConfig.quadrants.forEach(quadrant => {
      // Create the regex pattern by replacing placeholders
      const pattern = new RegExp(
        bcgConfig.regex.quadrant
          .replace('{quadrant}', quadrant)
          .replace('{allQuadrants}', allQuadrants),
        'i'
      );

      const match = pattern.exec(analysisResult);

      if (match) {
        const content = match[1].trim();
        const items = content
          .split(/\n+/)
          .map(line => line.replace(/^[\s•\-\d.]+/, '').trim())
          .filter(item => item.length > 0);
        extractedData[quadrant] = items;
      } else {
        extractedData[quadrant] = [];
      }
    });

    return extractedData;
  }, [analysisResult, bcgConfig]);

  const getConclusionText = () => {
    if (!analysisResult) return "";
    const conclusionRegex = new RegExp(analysisConfig.shared.regex.conclusion, 'i');
    const conclusionMatch = conclusionRegex.exec(analysisResult);
    return conclusionMatch ? conclusionMatch[0] : "";
  };

  return (
    <div className="bcg-matrix-container">
      <h4 className="text-center mt-4"><strong>{bcgConfig.title}</strong></h4> 
      <div className="bcg-matrix-template">
        <div className="bcg-matrix-header">
          <div className="matrix-label-y">High</div>
          <div className="matrix-label-center">Market Growth Rate</div>
          <div className="matrix-label-y">Low</div>
        </div>

        <div className="bcg-matrix-grid">
          {/* Agile Leaders (Stars) - Top Left */}
          <div className="bcg-box stars-bg">
            <h6>{bcgConfig.quadrants[0]}</h6>
            <p className="matrix-description">{bcgConfig.descriptions[bcgConfig.quadrants[0]]}</p>
            {matrixData[bcgConfig.quadrants[0]].map((item, i) => (
              <div key={`agile-${i}`} className="analysis-box">
                {item}
              </div>
            ))}
          </div>

          {/* Emerging Innovators (Question Marks) - Top Right */}
          <div className="bcg-box question-marks-bg">
            <h6>{bcgConfig.quadrants[2]}</h6>
            <p className="matrix-description">{bcgConfig.descriptions[bcgConfig.quadrants[2]]}</p>
            {matrixData[bcgConfig.quadrants[2]].map((item, i) => (
              <div key={`emerging-${i}`} className="analysis-box">
                {item}
              </div>
            ))}
          </div>

          {/* Established Performers (Cash Cows) - Bottom Left */}
          <div className="bcg-box cash-cows-bg">
            <h6>{bcgConfig.quadrants[1]}</h6>
            <p className="matrix-description">{bcgConfig.descriptions[bcgConfig.quadrants[1]]}</p>
            {matrixData[bcgConfig.quadrants[1]].map((item, i) => (
              <div key={`established-${i}`} className="analysis-box">
                {item}
              </div>
            ))}
          </div>

          {/* Strategic Drifters (Dogs) - Bottom Right */}
          <div className="bcg-box dogs-bg">
            <h6>{bcgConfig.quadrants[3]}</h6>
            <p className="matrix-description">{bcgConfig.descriptions[bcgConfig.quadrants[3]]}</p>
            {matrixData[bcgConfig.quadrants[3]].map((item, i) => (
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
      <StrategicAcronym analysisResult={analysisResult} />
      {getConclusionText() && (
        <div className="mt-3 conclusion-text">
          {getConclusionText()}
        </div>
      )}
    </div>
  );
};

export default BCGMatrix;