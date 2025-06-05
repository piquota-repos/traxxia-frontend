import React, { useMemo } from 'react';
import '../styles/dashboard.css';

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

    // Enhanced cleaning to handle various conclusion formats and malformed markdown
    let cleanText = analysisResult.replace(/\*{2,}\s*Conclusion\s*\*{2,}[\s\S]*$/i, '');
    cleanText = cleanText.replace(/\*\*\s*Conclusion\s*:\s*\*\*[\s\S]*$/i, '');
    cleanText = cleanText.replace(/\*\*Conclusion:\*\*[\s\S]*$/i, '');
    cleanText = cleanText.replace(/In conclusion[\s\S]*$/i, '');
    cleanText = cleanText.replace(/Given the incomplete[\s\S]*$/i, '');
    cleanText = cleanText.replace(/To drive success[\s\S]*$/i, '');
    cleanText = cleanText.replace(/\*\*Actionable Recommendations:\*\*[\s\S]*$/i, '');

    const extractedData = {};

    quadrantLabels.forEach(label => {
      // Enhanced pattern to match each quadrant section and stop at conclusion markers
      const pattern = new RegExp(
        `\\*\\*\\s*${label}\\s*(?:\\(.*?\\))?\\s*:\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*\\s*(?:${quadrantLabels.join('|')
        })\\s*(?:\\(.*?\\))?\\s*:\\*\\*|\\*{2,}\\s*Conclusion\\s*\\*{2,}|\\*\\*\\s*Conclusion\\s*:\\s*\\*\\*|\\*\\*Conclusion:\\*\\*|\\*\\*Actionable Recommendations:\\*\\*|Given the incomplete|In conclusion|To drive success|Conclusion:|$)`,
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
        content = content.replace(/Given the incomplete[\s\S]*$/i, '');
        content = content.replace(/To drive success[\s\S]*$/i, '');
        content = content.replace(/By implementing these[\s\S]*$/i, '');

        // Handle case where conclusion appears immediately after the content with malformed markdown
        const conclusionIndex = content.toLowerCase().search(/\*{0,}\s*conclusion/i);
        if (conclusionIndex > -1 && conclusionIndex < content.length - 15) {
          content = content.substring(0, conclusionIndex).trim();
        }

        // Remove trailing asterisks that might be left over from malformed markdown
        content = content.replace(/\*+\s*$/, '').trim();

        // Extract items from bullet points, dashes, or numbered lists
        const items = content
          .split(/\n+/)
          .map(line => line.replace(/^[\s•\-\d.]+/, '').trim())
          .filter(item => item.length > 0 && 
                  !item.toLowerCase().startsWith('in conclusion') &&
                  !item.toLowerCase().includes('conclusion') &&
                  !item.toLowerCase().startsWith('given the incomplete') &&
                  !item.toLowerCase().startsWith('to drive success'));

        extractedData[label] = items;
      } else {
        extractedData[label] = [];
      }
    });

    return extractedData;
  }, [analysisResult]);

  const getConclusionText = () => {
    if (!analysisResult) return "";

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
      /\*\*\s*Conclusion\s*\*\*\s*([\s\S]*?)(?=\*\*Actionable Recommendations:\*\*|Actionable Recommendations:|$)/i,
      // Match BCG-specific conclusion patterns
      /Given the incomplete[\s\S]*?(?=\*\*Actionable Recommendations:\*\*|Actionable Recommendations:|$)/i,
      /To drive success[\s\S]*?(?=\*\*Actionable Recommendations:\*\*|Actionable Recommendations:|$)/i
    ];

    for (const pattern of conclusionPatterns) {
      const match = pattern.exec(analysisResult);
      if (match) {
        let conclusion = match[1] || match[0];

        // Clean up the conclusion text - handle various malformed markdown patterns
        conclusion = conclusion.replace(/^\*{2,}\s*Conclusion\s*\*{2,}\s*/i, '');
        conclusion = conclusion.replace(/^\*\*\s*Conclusion\s*:\s*\*\*\s*/i, '');
        conclusion = conclusion.replace(/^\*\*Conclusion:\*\*\s*/i, '');
        conclusion = conclusion.replace(/^\*\*\s*Conclusion\s*\*\*\s*/i, '');
        conclusion = conclusion.replace(/^Conclusion:\s*/i, '');
        conclusion = conclusion.replace(/^In conclusion[,:]\s*/i, '');
        conclusion = conclusion.replace(/^Given the incomplete/i, 'Given the incomplete');
        conclusion = conclusion.replace(/^To drive success/i, 'To drive success');
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
    if (!analysisResult) return "";

    const actionablePattern = /\*\*Actionable Recommendations:\*\*([\s\S]*?)$/i;
    const match = actionablePattern.exec(analysisResult);

    if (match) {
      return match[1].trim();
    }

    return "";
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

export default BCGMatrix;