import React from 'react';
import SwotAnalysis from './SwotAnalysis';
import PortersAnalysis from './PorterMatrix';
import BcgAnalysis from './BCGMatrix';
import ValueChainAnalysis from './ValueChainMatrix';
import StrategicAnalysis from './StrategicAcronym';
import { ANALYSIS_NAMES } from '../utils/analysisHelpers';

const AnalysisRenderer = ({ 
  selectedAnalysisType, 
  analysisItem, 
  analysisResult, 
  isLoading 
}) => {
  if (!selectedAnalysisType) {
    return (
      <div className="analysis-content-workspace">
        <div className="analysis-content-header centered">
          <h4>Select an Analysis Type</h4>
          <p>Choose from the options above to begin your analysis</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="analysis-loading">
        <div className="quantum-loader-container mb-3">
          <div className="quantum-loader">
            <div className="quantum-dot"></div>
            <div className="quantum-dot"></div>
            <div className="quantum-dot"></div>
            <div className="quantum-dot"></div>
            <div className="quantum-dot"></div>
          </div>
          <p>Generating {selectedAnalysisType} analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="analysis-content-workspace">
        <div className="analysis-content-header centered">
          <h4>No Analysis Data</h4>
          <p>No analysis data available for {selectedAnalysisType}</p>
        </div>
      </div>
    );
  }

  const renderAnalysisComponent = () => {
    switch (selectedAnalysisType) {
      case 'swot':
        return <SwotAnalysis analysisResult={analysisResult} />;
      case 'porter':
        return <PortersAnalysis porterText={analysisResult} />;
      case 'bcg':
        return <BcgAnalysis analysisResult={analysisResult} />;
      case 'valuechain':
        return <ValueChainAnalysis analysisResult={analysisResult} />;
      case 'strategic':
        return <StrategicAnalysis analysisResult={analysisResult} />;
      default:
        return (
          <div className="analysis-content-workspace">
            <div className="analysis-content-header">
              <div className="analysis-content-icon">
                {analysisItem.icon}
              </div>
              <div>
                <h2>{selectedAnalysisType.toUpperCase()} Analysis</h2>
                <p className="analysis-content-subtitle">
                  {ANALYSIS_NAMES[selectedAnalysisType] || selectedAnalysisType} analysis results
                </p>
              </div>
            </div>
            <div className="analysis-content-body">
              <div 
                className="analysis-result-content"
                dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br/>') }}
              />
            </div>
          </div>
        );
    }
  };

  return renderAnalysisComponent();
};

export default AnalysisRenderer;