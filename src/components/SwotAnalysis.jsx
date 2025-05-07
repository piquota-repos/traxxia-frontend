import React from 'react';
import StrategicAcronym from './StrategicAcronym';
import analysisConfig from '../utils/analysisConfig.json';

const SwotAnalysis = ({ analysisResult }) => {
  // Access the SWOT configuration
  const swotConfig = analysisConfig.swot;
  
  // Create RegExp objects from the JSON configuration
  const introRegex = new RegExp(swotConfig.regex.intro, 's');
  const swotRegex = new RegExp(swotConfig.regex.swot, 'i');
  const conclusionRegex = new RegExp(analysisConfig.shared.regex.conclusion, 'i');
  const sectionPattern = new RegExp(swotConfig.regex.sectionPattern, 'gi');
  
  // Extract introduction text
  const introMatch = introRegex.exec(analysisResult);
  const introText = introMatch ? introMatch[1].trim() : "";
  
  // Extract SWOT analysis content
  const swotMatch = swotRegex.exec(analysisResult);
  const swotContent = swotMatch ? swotMatch[1].trim() : "";
  
  // Extract conclusion text
  const conclusionMatch = conclusionRegex.exec(analysisResult);
  const conclusionText = conclusionMatch ? conclusionMatch[0] : "";
  
  // Extract SWOT sections
  const swotData = extractAnalysisSections(swotContent, sectionPattern);
  const labels = Object.keys(swotData);
  
  return (
    <>
      <h4 className="text-center mt-4"><strong>{swotConfig.headings.main}</strong></h4>
      
      {introText && <div className="mb-3">{introText}</div>}
      
      {labels.length > 0 && (
        <>
          <h5 className="mb-3">
            <strong>{swotConfig.headings.table}</strong>
          </h5>
          <div className="table-responsive mb-4">
            <table className="table table-bordered table-striped">
              <thead className="table-light">
                <tr>
                  {labels.map(label => <th key={label}>{label}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {labels.map(label => (
                    <td key={label}>
                      {renderAnalysisBoxes(swotData[label], label)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
      
      <StrategicAcronym analysisResult={analysisResult} />
      
      {conclusionText && (
        <div className="mt-3 conclusion-text">
          {conclusionText}
        </div>
      )}
    </>
  );
};

// Helper function to extract analysis sections
const extractAnalysisSections = (analysisBlock, sectionPattern) => {
  const analysisData = {};
  
  let m;
  // Need to reset the RegExp because it's using the 'g' flag
  const pattern = new RegExp(sectionPattern);
  
  while ((m = pattern.exec(analysisBlock)) !== null) {
    const key = m[1].trim();
    const value = m[2]
      .split(/\n(?=\*\*|\d+\.\s)/)[0]
      .trim()
      .replace(/\n/g, "<br/>");
    analysisData[key] = value;
  }
  
  return analysisData;
};

// Helper function to render analysis boxes
const renderAnalysisBoxes = (content, label) => {
  const swotConfig = analysisConfig.swot;
  const normalizedLabel = label.toLowerCase().replace(/\s+/g, '-');
  const bgClass = `${normalizedLabel}-bg`;
  
  return content
    .split(/<br\s*\/?>\s*(?=<br\s*\/?>|[^<])/i)
    .map((para) => para.trim())
    .filter((para) => {
      // Filter out strings to ignore
      if (swotConfig.sectionFilterRules.ignoreStrings.includes(para)) {
        return false;
      }
      
      // Filter out pattern matches
      for (const pattern of swotConfig.sectionFilterRules.ignorePatterns) {
        if (new RegExp(pattern).test(para)) {
          return false;
        }
      }
      
      return true;
    })
    .map((para, idx) => {
      return (
        <div
          key={idx}
          className={`analysis-box ${bgClass}`}
          dangerouslySetInnerHTML={{ __html: para }}
        />
      );
    });
};

export default SwotAnalysis;