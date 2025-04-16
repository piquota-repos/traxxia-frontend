import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import {
  Activity,
  Briefcase,
  Bell,
  PieChart,
  BarChart
} from 'lucide-react';

// Constants
const ANALYSIS_ICONS = {
  swot: Activity,
  pestle: Briefcase,
  noise: Bell,
  vrio: PieChart,
  bsc: BarChart
};

// Analysis section configuration for different analysis types
const ANALYSIS_CONFIG = {
  pestle: {
    mainPattern: /\*\*\s*PESTLE Analysis\s*:\*\*([\s\S]*?)(?=\*\*\s*(Areas for Improvement|STRATEGIC Acronym|Next Steps|Recommendations)\s*:\*\*|$)/i,
    sectionPattern: /\*\*\s*(Political|Economic|Social|Technological|Legal|Environmental)\s*:\*\*\s*([\s\S]*?)(?=(\*\*\s*(Political|Economic|Social|Technological|Legal|Environmental|STRATEGIC Acronym|Areas for Improvement|Next Steps|Recommendations)\s*:\*\*|$))/gi,
    title: "PESTLE Analysis Table"
  },
  swot: {
    mainPattern: /\*\*\s*SWOT Analysis\s*:\*\*([\s\S]*?)(?=\*\*\s*(Areas for Improvement|STRATEGIC Acronym|Next Steps|Recommendations)\s*:\*\*|$)/i,
    sectionPattern: /\*\*\s*(Strengths|Weaknesses|Opportunities|Threats)\s*:\*\*\s*([\s\S]*?)(?=(\*\*\s*(Strengths|Weaknesses|Opportunities|Threats|STRATEGIC Acronym|Areas for Improvement|Next Steps|Recommendations)\s*:\*\*|$))/gi,
    title: "SWOT Analysis Table"
  },
  vrio: {
    mainPattern: /\*\*\s*VRIO Analysis\s*:\*\*([\s\S]*?)(?=\*\*\s*(Areas for Improvement|STRATEGIC Acronym|Next Steps|Recommendations)\s*:\*\*|$)/i,
    sectionPattern: /\*\*\s*(Value|Rarity|Imitability|Organization)\s*:\*\*\s*([\s\S]*?)(?=(\*\*\s*(Value|Rarity|Imitability|Organization|STRATEGIC Acronym|Areas for Improvement|Next Steps|Recommendations)\s*:\*\*|$))/gi,
    title: "VRIO Analysis Table"
  },
  noise: {
    mainPattern: /\*\*\s*NOISE Analysis\s*:\*\*([\s\S]*?)(?=\*\*\s*(Areas for Improvement|STRATEGIC Acronym|Next Steps|Recommendations)\s*:\*\*|$)/i,
    sectionPattern: /\*\*\s*(Needs|Opportunities|Improvements|Strengths|Exceptions)\s*:\*\*\s*([\s\S]*?)(?=(\*\*\s*(Needs|Opportunities|Improvements|Strengths|Exceptions|STRATEGIC Acronym|Areas for Improvement|Next Steps|Recommendations)\s*:\*\*|$))/gi,
    title: "NOISE Analysis Table"
  },
  bsc: {
    mainPattern: /\*\*\s*Balanced Scorecard Analysis\s*:\*\*([\s\S]*?)(?=\*\*\s*(Areas for Improvement|STRATEGIC Acronym|Next Steps|Recommendations)\s*:\*\*|$)/i,
    sectionPattern: /\*\*\s*(Financial|Customer|Internal Business Processes|Learning and Growth)\s*:\*\*\s*([\s\S]*?)(?=(\*\*\s*(Financial|Customer|Internal Business Processes|Learning and Growth|STRATEGIC Acronym|Areas for Improvement|Next Steps|Recommendations)\s*:\*\*|$))/gi,
    title: "Balanced Scorecard Analysis"
  }
};

// Helper components
const LoadingIndicator = () => (
  <div className="text-center analysis-loading">
    <h5 className="mb-3 text-muted">Analyzing Your Responses</h5>
    <ProgressBar
      animated
      now={75}
      variant="primary"
      className="analysis-progress"
    />
  </div>
);

const AnalysisTypeSelector = ({ analysisTypes, selectedType, onTypeSelect }) => (
  <div className="analysis-header mb-4">
    <div className="d-flex justify-content-center align-items-center">
      {analysisTypes.map((type) => {
        const Icon = ANALYSIS_ICONS[type.id] || BarChart;
        const isSelected = selectedType === type.id;
        
        return (
          <div
            key={type.id}
            className={`analysis-type-pill ${isSelected ? 'selected' : ''}`}
            title={type.name}
            onClick={() => onTypeSelect(type.id)}
          >
            <div className="icon-wrapper">
              <Icon
                size={20}
                className={`analysis-icon ${isSelected ? 'text-primary' : 'text-muted'}`}
              />
              <p>{type.name}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const AnalysisButton = ({ selectedType, onClick, loading }) => (
  selectedType && (
    <div className="text-center mt-3">
      <button
        className="btn btn-primary"
        onClick={onClick}
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'Generate Analysis'}
      </button>
    </div>
  )
);

// Generic Analysis renderer
const GenericAnalysisRenderer = ({ analysisResult, analysisType }) => {
  // Get config for selected analysis type or use default
  const config = ANALYSIS_CONFIG[analysisType] || ANALYSIS_CONFIG.pestle;
  
  // Extract main analysis block
  const mainRegex = config.mainPattern;
  const match = mainRegex.exec(analysisResult);
  const analysisBlock = match ? match[1].trim() : "";
  
  // Extract intro text (content before the main analysis block)
  const introText = match ? analysisResult.slice(0, match.index).trim() : "";
  
  // Extract content after the analysis block (recommendations, next steps, etc.)
  const afterRegex = /\*\*\s*(Areas for Improvement|Next Steps|STRATEGIC Acronym|Recommendations)\s*:\*\*([\s\S]*)/i;
  const afterMatch = afterRegex.exec(analysisResult);
  const afterText = afterMatch ? afterMatch[0].trim() : "";
  
  // Extract analysis sections
  const analysisData = extractAnalysisSections(analysisBlock, config.sectionPattern);
  const labels = Object.keys(analysisData);
  const hasContent = introText?.trim() || labels.length > 0 || afterText?.trim();
  
  if (!hasContent) {
    return <div>No analysis results available.</div>;
  }
  
  return (
    <>
      {introText && <div className="mb-3">{introText}</div>}
      
      {labels.length > 0 && (
        <>
          <h5 className="mb-3">
            <strong>{config.title}</strong>
          </h5>
          <div className="table-responsive mb-4">
            <table className="table table-bordered table-striped">
              <thead className="table-light">
                <tr>
                  {labels.map((label) => (
                    <th key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {labels.map((label) => (
                    <td key={label}>
                      {renderAnalysisBoxes(analysisData[label], label, analysisType)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
      
      {afterText && (
        <div
          className="mt-3"
          dangerouslySetInnerHTML={{
            __html: afterText.replace(/\n/g, "<br/>"),
          }}
        />
      )}
    </>
  );
};

// Helper function to extract analysis sections
const extractAnalysisSections = (analysisBlock, sectionPattern) => {
  const analysisData = {};
  
  let m;
  while ((m = sectionPattern.exec(analysisBlock)) !== null) {
    const key = m[1];
    const value = m[2]
      .split(/\n(?=\*\*|\d+\.\s)/)[0]
      .trim()
      .replace(/\n/g, "<br/>");
    analysisData[key] = value;
  }
  
  return analysisData;
};

// Helper function to render analysis boxes
const renderAnalysisBoxes = (content, label, analysisType) => {
  // Generate CSS class from label and analysis type
  const getBoxClass = (label, type) => {
    // Normalize the label to lowercase with no spaces
    const normalizedLabel = label.toLowerCase().replace(/\s+/g, '-');
    return `${normalizedLabel}-bg`;
  };

  return content
    .split(/<br\s*\/?>\s*(?=<br\s*\/?>|[^<])/i)
    .filter((para) => para.trim() !== "")
    .map((para, idx) => {
      const bgClass = getBoxClass(label, analysisType);
      return (
        <div
          key={idx}
          className={`analysis-box ${bgClass}`}
          dangerouslySetInnerHTML={{
            __html: para,
          }}
        />
      );
    });
};

// Main component
const AnalysisContent = ({
  loading,
  selectedAnalysisType,
  analysisTypes,
  analysisResult,
  onAnalysisTypeSelect,
  onAnalyzeResponses,
  onResetAnalysisResult,
  onClose
}) => {
  const handleAnalysisTypeSelect = (typeId) => {
    onResetAnalysisResult();
    onAnalysisTypeSelect(typeId);
  };

  const renderAnalysisResults = () => {
    if (!analysisResult?.trim()) {
      return <div>No analysis results available.</div>;
    }

    // Use our generic renderer for all analysis types
    return <GenericAnalysisRenderer 
      analysisResult={analysisResult} 
      analysisType={selectedAnalysisType}
    />;
  };

  return (
    <div className="analysis-container p-4">
      {loading ? (
        <LoadingIndicator />
      ) : (
        <div className="analysis-results">
          <AnalysisTypeSelector
            analysisTypes={analysisTypes}
            selectedType={selectedAnalysisType}
            onTypeSelect={handleAnalysisTypeSelect}
          />

          <AnalysisButton
            selectedType={selectedAnalysisType}
            onClick={onAnalyzeResponses}
            loading={loading}
          />

          <br />

          <div className="analysis-container">
            {renderAnalysisResults()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisContent;