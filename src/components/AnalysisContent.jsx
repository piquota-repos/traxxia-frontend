import React,{useEffect,useState} from 'react';
import { ProgressBar } from 'react-bootstrap';
import {
  Activity,
  Briefcase,
  Bell,
  PieChart,
  BarChart,
  Network,
  Link,
  ChartColumnBig,
  Grid
} from 'lucide-react';  
import ValueChainMatrix from './ValueChainMatrix';
import BCGMatrix from './BCGMatrix'; 
import PorterMatrix from './PorterMatrix';
import SwotAnalysis from './SwotAnalysis';
import StrategicAcronym from './StrategicAcronym';

// Constants
const ANALYSIS_ICONS = {
  strategic: ChartColumnBig,
  swot: Activity,
  pestle: Briefcase,
  noise: Bell,
  vrio: PieChart,
  bsc: BarChart,
  porter: Network,
  valuechain: Link,
  bcg: Grid
};

// Analysis section configuration for different analysis types
const ANALYSIS_CONFIG = { 
  swot: {
    mainPattern: /\*\*\s*SWOT Analysis\s*:\*\*([\s\S]*?)(?=\*\*\s*(Areas for Improvement|Next Steps|Recommendations)\s*:\*\*|$)/i,
    sectionPattern: /\*\*\s*(Strengths|Weaknesses|Opportunities|Threats)\s*:\*\*\s*([\s\S]*?)(?=(\*\*\s*(Strengths|Weaknesses|Opportunities|Threats|Areas for Improvement|Next Steps|Recommendations)\s*:\*\*|$))/gi,
    title: "SWOT Analysis Table"
  }, 
  porter: {
    mainPattern: /\*\*\s*Porter(?:'s)? Five Forces Analysis\s*:\*\*([\s\S]*?)(?=\*\*\s*(Areas for Improvement|Next Steps|Recommendations)\s*:\*\*|$)/i,
    sectionPattern: /\*\*\s*(Supplier Power|Buyer Power|Competitive Rivalry|Threat of Substitution|Threat of New Entry)\s*:\*\*\s*([\s\S]*?)(?=(\*\*\s*(Supplier Power|Buyer Power|Competitive Rivalry|Threat of Substitution|Threat of New Entry|Areas for Improvement|Next Steps|Recommendations)\s*:\*\*|$))/gi,
    title: "Porter's Five Forces Analysis"
  },
  valuechain: {
    mainPattern: /\*\*\s*Value Chain Analysis\s*:\*\*([\s\S]*?)(?=\*\*\s*(Areas for Improvement|Next Steps|Recommendations)\s*:\*\*|$)/i,
    sectionPattern: /\*\*\s*(Primary Activities|Support Activities|Margin Analysis)\s*:\*\*\s*([\s\S]*?)(?=(\*\*\s*(Primary Activities|Support Activities|Margin Analysis|Areas for Improvement|Next Steps|Recommendations)\s*:\*\*|$))/gi,
    title: "Value Chain Analysis"
  },
  bcg: {
    mainPattern: /\*\*\s*BCG Matrix Analysis\s*:\*\*([\s\S]*?)(?=\*\*\s*(Areas for Improvement|Next Steps|Recommendations)\s*:\*\*|$)/i,
    sectionPattern: /\*\*\s*(Stars|Cash Cows|Question Marks|Dogs)\s*:\*\*\s*([\s\S]*?)(?=(\*\*\s*(Stars|Cash Cows|Question Marks|Dogs|Areas for Improvement|Next Steps|Recommendations)\s*:\*\*|$))/gi,
    title: "BCG Matrix Analysis"
  },
  strategic: {
    mainPattern: /\*\*\s*STRATEGIC Acronym\s*:\*\*([\s\S]*?)(?=\*\*\s*(Areas for Improvement|Next Steps|Recommendations)\s*:\*\*|$)/i,
    sectionPattern: /\*\*\s*(S|T|R|A|T|E|G|I|C)\s*:\*\*\s*([\s\S]*?)(?=(\*\*\s*(S|T|R|A|T|E|G|I|C|Areas for Improvement|Next Steps|Recommendations)\s*:\*\*|$))/gi,
    title: "STRATEGIC Acronym Analysis"
  }
};

const LoadingIndicator = () => (
  <div className="text-center analysis-loading py-4">
    <div className="rainbow-loader-container mb-3">
      <div className="rainbow-spinner">
        <div className="spinner-ring ring1"></div>
        <div className="spinner-ring ring2"></div>
        <div className="spinner-ring ring3"></div>
        <div className="spinner-core"></div>
      </div>
    </div>  
  </div>
);

const AnalysisTypeSelector = ({ analysisTypes, selectedType, onTypeSelect }) => (
  <div className="analysis-header mb-4">
    <div className="d-flex justify-content-center align-items-center flex-wrap">
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

// Special BSC renderer that shows full text instead of table
const BSCAnalysisRenderer = ({ analysisResult }) => {
  const introRegex = /^(.*?)(?=\*\*BSC Analysis|\*\*Balanced Scorecard Analysis)/s;
  const introMatch = introRegex.exec(analysisResult);
  const introText = introMatch ? introMatch[1].trim() : "";
 
  const bscRegex = /\*\*\s*(?:BSC|Balanced Scorecard) Analysis\s*:\*\*([\s\S]*?)(?=\*\*\s*STRATEGIC Acronym\s*:\*\*|$)/i;
  const bscMatch = bscRegex.exec(analysisResult);
  const bscContent = bscMatch ? bscMatch[1].trim() : "";
 
  const conclusionRegex = /By following (?:the STRATEGIC acronym|these (?:recommendations|actionable items))[\s\S]*?$/i;
  const conclusionMatch = conclusionRegex.exec(analysisResult);
  const conclusionText = conclusionMatch ? conclusionMatch[0] : "";
 
  const sectionPattern = /\*\*\s*(Financial|Customer|Internal Processes|Learning and Growth) Perspective\s*:\*\*\s*([\s\S]*?)(?=(\*\*\s*(Financial|Customer|Internal Processes|Learning and Growth) Perspective\s*:\*\*|$))/gi;
  const bscData = extractAnalysisSections(bscContent, sectionPattern);
  const labels = Object.keys(bscData);
 
  return (
    <>
      {introText && <div className="mb-3">{introText}</div>}
 
      {labels.length > 0 && (
        <>
          <h5 className="mb-3">
            <strong>Balanced Scorecard Analysis</strong>
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
                      {renderAnalysisBoxes(bscData[label], label, 'bsc')}
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

const GenericAnalysisRenderer = ({ analysisResult, analysisType }) => {
  const config = ANALYSIS_CONFIG[analysisType] || ANALYSIS_CONFIG.pestle;

  const mainRegex = config.mainPattern;
  const match = mainRegex.exec(analysisResult);
  const analysisBlock = match ? match[1].trim() : "";

  const introText = match ? analysisResult.slice(0, match.index).trim() : "";

  const afterRegex = /\*\*\s*(Areas for Improvement|Next Steps|STRATEGIC Acronym|Recommendations)\s*:\*\*([\s\S]*)/i;
  const afterMatch = afterRegex.exec(analysisResult);
  const afterText = afterMatch ? afterMatch[0].trim() : "";

  const analysisData = extractAnalysisSections(analysisBlock, config.sectionPattern);
  const labels = Object.keys(analysisData);
  const hasContent = introText?.trim() || labels.length > 0 || afterText?.trim();

  const conclusionRegex = /By following (?:the STRATEGIC acronym|these (?:recommendations|actionable items))[\s\S]*?$/i;
  const conclusionMatch = conclusionRegex.exec(analysisResult);
  const conclusionText = conclusionMatch ? conclusionMatch[0] : "";

  if (!hasContent) return <div>No analysis results available.</div>;

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

      <StrategicAcronym analysisResult={analysisResult} />

      {conclusionText && (
        <div className="mt-3 conclusion-text">
          {conclusionText}
        </div>
      )}
    </>
  );
};

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
const renderAnalysisBoxes = (content, label, analysisType) => {
  const getBoxClass = (label, type) => {
    const normalizedLabel = label.toLowerCase().replace(/\s+/g, '-');
    return `${normalizedLabel}-bg`;
  };

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
      const bgClass = getBoxClass(label, analysisType);
      return (
        <div
          key={idx}
          className={`analysis-box ${bgClass}`}
          dangerouslySetInnerHTML={{ __html: para }}
        />
      );
    });
};

const AnalysisContent = ({
  loading,
  selectedAnalysisType,
  analysisTypes,
  analysisResult,
  onAnalysisTypeSelect,
  onAnalyzeResponses,
  onResetAnalysisResult,
  onClose,
  activeTab // New prop to determine which tab is active
}) => {
  const [lastActiveTab, setLastActiveTab] = useState(activeTab);
  const [hasUserSelectedType, setHasUserSelectedType] = useState(false);

  useEffect(() => {
    // Only set default when tab changes, not when user manually selects a type
    if (activeTab !== lastActiveTab) {
      const defaultType = activeTab === 'tab1' ? 'swot' : 'strategic';
      
      onResetAnalysisResult(); // Clear old results when switching tabs
      onAnalysisTypeSelect(defaultType);
      setLastActiveTab(activeTab);
      setHasUserSelectedType(false); // Reset user selection flag when tab changes
    } else if (!selectedAnalysisType) {
      // Set initial default only if no type is selected
      const defaultType = activeTab === 'tab1' ? 'swot' : 'strategic';
      onAnalysisTypeSelect(defaultType);
    } else if (!analysisResult || analysisResult.trim() === '') {
      // Generate analysis if we have a type but no result
      onAnalyzeResponses();
    }
  }, [activeTab, lastActiveTab, selectedAnalysisType, analysisResult, onAnalysisTypeSelect, onAnalyzeResponses, onResetAnalysisResult]);

  const handleAnalysisTypeSelect = (typeId) => {
    setHasUserSelectedType(true); // Mark that user has manually selected a type
    onResetAnalysisResult(); // Clear old results when changing type
    onAnalysisTypeSelect(typeId);
  };

  const renderAnalysisResults = () => {
    if (!analysisResult?.trim()) {
      return <div>No analysis results available.</div>;
    }

    // Use specific renderers for specialized analysis types
    if (selectedAnalysisType === 'bsc') {
      return <BSCAnalysisRenderer analysisResult={analysisResult} />;
    } else if (selectedAnalysisType === 'valuechain') {
      return <ValueChainMatrix analysisResult={analysisResult} />;
    } else if (selectedAnalysisType === 'bcg') {
      return <BCGMatrix analysisResult={analysisResult} />; 
    } else if (selectedAnalysisType === 'porter') {
      return <PorterMatrix porterText={analysisResult} />; 
    } else if (selectedAnalysisType === 'swot') {
      return <SwotAnalysis analysisResult={analysisResult} />;
    }
    else if (selectedAnalysisType === 'strategic') {
      return <StrategicAcronym analysisResult={analysisResult} />;
    }

    // Use generic renderer for all other analysis types
    return <GenericAnalysisRenderer
      analysisResult={analysisResult}
      analysisType={selectedAnalysisType}
    />;
  };

  return (
    <div className="analysis-container">
       <AnalysisTypeSelector
            analysisTypes={analysisTypes}
            selectedType={selectedAnalysisType}
            onTypeSelect={handleAnalysisTypeSelect}
          />

      {loading ? (
        <LoadingIndicator />
      ) : (
        <div className="analysis-results">
         
          <div className="analysis-container">
            {renderAnalysisResults()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisContent;