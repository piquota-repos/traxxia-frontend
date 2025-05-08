import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css';
import StrategicAcronym from './StrategicAcronym';
import analysisConfig from '../utils/analysisConfig.json';

// Helper functions moved outside the component
const getActivityKey = (label) => {
  return label.toLowerCase().replace(/\s+/g, '').replace('&', '');
};

const initializeActivities = (config) => {
  const initialState = {
    primaryActivities: {},
    supportActivities: {},
    margin: { summary: '' },
    linkages: { summary: '' },
  };
  
  // Initialize primary activities
  config.sections.primary.activities.forEach(activity => {
    initialState.primaryActivities[getActivityKey(activity)] = '';
  });
  
  // Initialize support activities
  config.sections.support.activities.forEach(activity => {
    initialState.supportActivities[getActivityKey(activity)] = '';
  });
  
  return initialState;
};

const ValueChainMatrix = ({ analysisResult }) => { 
  const vcConfig = analysisConfig.valuechain; 
  const [sections, setSections] = useState(() => initializeActivities(vcConfig));

  useEffect(() => {
    if (analysisResult) {
      const parsedData = parseAnalysisResult(analysisResult);
      setSections(parsedData);
    }
  }, [analysisResult]);

  const cleanText = (text) => text.replace(/^:\s*/, '');

  const parseAnalysisResult = (text) => {
    const result = initializeActivities(vcConfig);

    // Parse Primary Activities
    const primarySectionMatch = new RegExp(vcConfig.sections.primary.regex.section, 'i').exec(text);
    if (primarySectionMatch) {
      const primaryContent = primarySectionMatch[1].trim();
      
      vcConfig.sections.primary.activities.forEach((activity, index) => {
        const nextActivity = index < vcConfig.sections.primary.activities.length - 1 
          ? vcConfig.sections.primary.activities[index + 1] 
          : '';
        
        const activityPattern = vcConfig.sections.primary.regex.activity
          .replace('{activity}', activity)
          .replace('{nextActivity}', nextActivity);
        
        const activityMatch = new RegExp(activityPattern, 'i').exec(primaryContent);
        if (activityMatch) {
          result.primaryActivities[getActivityKey(activity)] = cleanText(activityMatch[1].trim());
        }
      });
    }

    // Parse Support Activities
    const supportSectionMatch = new RegExp(vcConfig.sections.support.regex.section, 'i').exec(text);
    if (supportSectionMatch) {
      const supportContent = supportSectionMatch[1].trim();
      
      vcConfig.sections.support.activities.forEach((activity, index) => {
        const nextActivity = index < vcConfig.sections.support.activities.length - 1 
          ? vcConfig.sections.support.activities[index + 1] 
          : '';
        
        const activityPattern = vcConfig.sections.support.regex.activity
          .replace('{activity}', activity)
          .replace('{nextActivity}', nextActivity);
        
        const activityMatch = new RegExp(activityPattern, 'i').exec(supportContent);
        if (activityMatch) {
          result.supportActivities[getActivityKey(activity)] = cleanText(activityMatch[1].trim());
        }
      });
    }

    // Parse Margin
    const marginMatch = new RegExp(vcConfig.sections.margin.regex, 'i').exec(text);
    if (marginMatch) {
      result.margin.summary = marginMatch[1].trim();
    }

    // Parse Linkages
    const linkagesMatch = new RegExp(vcConfig.sections.linkages.regex, 'i').exec(text);
    if (linkagesMatch) {
      result.linkages.summary = linkagesMatch[1].trim();
    }

    return result;
  };

  const getConclusionText = () => {
    if (!analysisResult) return "";
    const conclusionRegex = new RegExp(analysisConfig.shared.regex.conclusion, 'i');
    const conclusionMatch = conclusionRegex.exec(analysisResult);
    return conclusionMatch ? conclusionMatch[0] : "";
  };

  return (
    <div className="value-chain-static">
      <h4 className="text-center mb-4">{vcConfig.title}</h4>

      {/* Support Activities - Top Row */}
      <div className="support-activities">
        <div className="support-row">
          <div className="support-block infrastructure">
            <strong>Firm Infrastructure</strong>
            <span>{sections.supportActivities.firminfrastructure || 'No analysis available.'}</span>
          </div>
          <div className="support-block hr">
            <strong>Human Resource Management</strong>
            <span>{sections.supportActivities.humanresourcemanagement || 'No analysis available.'}</span>
          </div>
          <div className="support-block tech">
            <strong>Technology Development</strong>
            <span>{sections.supportActivities.technologydevelopment || 'No analysis available.'}</span>
          </div>
          <div className="support-block procurement">
            <strong>Procurement</strong>
            <span>{sections.supportActivities.procurement || 'No analysis available.'}</span>
          </div>
        </div>
      </div>

      {/* Primary Activities - Bottom Row */}
      <div className="primary-activities">
        <div className="primary-block inbound">
          <strong>Inbound Logistics</strong>
          <span>{sections.primaryActivities.inboundlogistics || 'No analysis available.'}</span>
        </div>
        <div className="primary-block operations">
          <strong>Operations</strong>
          <span>{sections.primaryActivities.operations || 'No analysis available.'}</span>
        </div>
        <div className="primary-block outbound">
          <strong>Outbound Logistics</strong>
          <span>{sections.primaryActivities.outboundlogistics || 'No analysis available.'}</span>
        </div>
        <div className="primary-block marketing">
          <strong>Marketing & Sales</strong>
          <span>{sections.primaryActivities.marketingsales || 'No analysis available.'}</span>
        </div>
        <div className="primary-block service">
          <strong>Service</strong>
          <span>{sections.primaryActivities.service || 'No analysis available.'}</span>
        </div>
      </div>

      {/* Margin and Linkages Analysis */}
      <div className="blue-triangle-container">
        <div className="blue-triangle">
          <div className="margin-analysis left-slant">
            <h5>Margin Analysis</h5>
            <p>{sections.margin.summary || 'No margin analysis available.'}</p>
          </div>
          
          <div className="linkages-analysis right-slant">
            <h5>Linkages Analysis</h5>
            <p>{sections.linkages.summary || 'No linkages analysis available.'}</p>
          </div>
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

export default ValueChainMatrix;