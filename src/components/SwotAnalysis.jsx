import React from 'react';

const SwotAnalysis = ({ analysisResult }) => {
  const introRegex = /^(.*?)(?=\*\*SWOT Analysis)/s;
  const introMatch = introRegex.exec(analysisResult);
  const introText = introMatch ? introMatch[1].trim() : "";

  const swotRegex = /\*\*\s*SWOT Analysis\s*:\*\*([\s\S]*?)(?=In conclusion|To address|By embracing|$)/i;
  const swotMatch = swotRegex.exec(analysisResult);
  const swotContent = swotMatch ? swotMatch[1].trim() : "";

  const conclusionRegex = /(In conclusion[\s\S]*?$|To address the weaknesses[\s\S]*?$|By embracing[\s\S]*?$)/i;
  const conclusionMatch = conclusionRegex.exec(analysisResult);
  const conclusionText = conclusionMatch ? conclusionMatch[0] : "";

  const sectionPattern = /\*\*\s*(Strengths|Weaknesses|Opportunities|Threats)\s*:\*\*\s*([\s\S]*?)(?=(\*\*\s*(Strengths|Weaknesses|Opportunities|Threats)\s*:\*\*|In conclusion|To address|By embracing|$))/gi;
  const swotData = extractAnalysisSections(swotContent, sectionPattern);
  const labels = Object.keys(swotData);

  return (
    <>
      <h4 className="text-center"><strong>SWOT Analysis</strong></h4>
      
      {introText && <div className="mb-3">{introText}</div>}
      
      {labels.length > 0 && (
        <>
          <h5 className="mb-3">
            <strong>SWOT Analysis Table</strong>
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
                      {renderAnalysisBoxes(swotData[label], label, 'swot')}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
      
       
      {conclusionText && (
        <div className="mt-4 conclusion-section">
          <h5><strong>Conclusion</strong></h5>
          <div className="conclusion-text">
            <div dangerouslySetInnerHTML={{ 
              __html: conclusionText.replace(/\n/g, "<br/>") 
            }} />
          </div>
        </div>
      )}
    </>
  );
};

// Helper function to extract analysis sections
const extractAnalysisSections = (analysisBlock, sectionPattern) => {
  const analysisData = {};

  let m;
  while ((m = sectionPattern.exec(analysisBlock)) !== null) {
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
  const normalizedLabel = label.toLowerCase().replace(/\s+/g, '-');
  const bgClass = `${normalizedLabel}-bg`;

  return content
    .split(/<br\s*\/?>\s*(?=<br\s*\/?>|[^<])/i)
    .map((para) => para.trim())
    .filter((para) => 
      para !== "" &&
      para !== "*" &&
      para !== "<br/>*" &&
      para !== "<br />*" &&
      !/^\*+$/.test(para) // removes any line that's just multiple `*`
    )
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