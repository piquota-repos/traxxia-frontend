import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css';
import StrategicAcronym from './StrategicAcronym';

const ValueChainMatrix = ({ analysisResult }) => {
  const [sections, setSections] = useState({
    primaryActivities: {
      overview: '',
      inboundLogistics: '',
      operations: '',
      outboundLogistics: '',
      marketingSales: '',
      service: ''
    },
    supportActivities: {
      overview: '',
      firmInfrastructure: '',
      hrManagement: '',
      techDevelopment: '',
      procurement: ''
    },
    margin: { summary: '' },
    linkages: { summary: '' },
  });

  useEffect(() => {
    if (analysisResult) {
      const parsedData = parseAnalysisResult(analysisResult);
      setSections(parsedData);
    }
  }, [analysisResult]);

  // Function to parse the analysisResult and extract relevant sections
  const parseAnalysisResult = (text) => {
    const result = {
      primaryActivities: {
        overview: '',
        inboundLogistics: '',
        operations: '',
        outboundLogistics: '',
        marketingSales: '',
        service: ''
      },
      supportActivities: {
        overview: '',
        firmInfrastructure: '',
        hrManagement: '',
        techDevelopment: '',
        procurement: ''
      },
      margin: { summary: '' },
      linkages: { summary: '' },
    };

    // Parse Primary Activities section
    const primaryMatch = text.match(/\*\*Primary Activities:\*\*([\s\S]*?)(?=\*\*Support Activities:|$)/i);
    
    if (primaryMatch) {
      const primaryContent = primaryMatch[1].trim();
      
      // Extract individual activities using bullet point pattern
      const inboundMatch = primaryContent.match(/- \*\*Inbound Logistics:\*\*([\s\S]*?)(?=- \*\*Operations:|$)/i);
      if (inboundMatch) result.primaryActivities.inboundLogistics = inboundMatch[1].trim();
      
      const operationsMatch = primaryContent.match(/- \*\*Operations:\*\*([\s\S]*?)(?=- \*\*Outbound Logistics:|$)/i);
      if (operationsMatch) result.primaryActivities.operations = operationsMatch[1].trim();
      
      const outboundMatch = primaryContent.match(/- \*\*Outbound Logistics:\*\*([\s\S]*?)(?=- \*\*Marketing (?:\u0026|&) Sales:|$)/i);
      if (outboundMatch) result.primaryActivities.outboundLogistics = outboundMatch[1].trim();
      
      const marketingMatch = primaryContent.match(/- \*\*Marketing (?:\u0026|&) Sales:\*\*([\s\S]*?)(?=- \*\*Service:|$)/i);
      if (marketingMatch) result.primaryActivities.marketingSales = marketingMatch[1].trim();
      
      const serviceMatch = primaryContent.match(/- \*\*Service:\*\*([\s\S]*?)(?=$)/i);
      if (serviceMatch) result.primaryActivities.service = serviceMatch[1].trim();
    }

    // Parse Support Activities section
    const supportMatch = text.match(/\*\*Support Activities:\*\*([\s\S]*?)(?=\*\*Margin:|$)/i);
    
    if (supportMatch) {
      const supportContent = supportMatch[1].trim();
      
      // Extract individual support activities
      const infraMatch = supportContent.match(/- \*\*Firm Infrastructure:\*\*([\s\S]*?)(?=- \*\*Human Resource Management:|$)/i);
      if (infraMatch) result.supportActivities.firmInfrastructure = infraMatch[1].trim();
      
      const hrMatch = supportContent.match(/- \*\*Human Resource Management:\*\*([\s\S]*?)(?=- \*\*Technology Development:|$)/i);
      if (hrMatch) result.supportActivities.hrManagement = hrMatch[1].trim();
      
      const techMatch = supportContent.match(/- \*\*Technology Development:\*\*([\s\S]*?)(?=- \*\*Procurement:|$)/i);
      if (techMatch) result.supportActivities.techDevelopment = techMatch[1].trim();
      
      const procurementMatch = supportContent.match(/- \*\*Procurement:\*\*([\s\S]*?)(?=$)/i);
      if (procurementMatch) result.supportActivities.procurement = procurementMatch[1].trim();
    }

    // Parse Margin section
    const marginMatch = text.match(/\*\*Margin:\*\*([\s\S]*?)(?=\*\*Linkages:|$)/i);
    if (marginMatch) {
      result.margin.summary = marginMatch[1].trim();
    }

    // Parse Linkages section
    const linkagesMatch = text.match(/\*\*Linkages:\*\*([\s\S]*?)(?=\*\*STRATEGIC Acronym:|$)/i);
    if (linkagesMatch) {
      result.linkages.summary = linkagesMatch[1].trim();
    }

    return result;
  };

  const getConclusionText = () => {
    if (!analysisResult) return "";

    const conclusionRegex = /By following the STRATEGIC acronym[\s\S]*?$/i;
    const conclusionMatch = conclusionRegex.exec(analysisResult);
    return conclusionMatch ? conclusionMatch[0] : "";
  };

  return (
    <div className="value-chain-static">
      <h4 className="text-center text-color mb-4">Value Chain Analysis</h4>

      {/* Support Activities */}
      <div className="support-activities">
        <div className="support-row">
          <div className="support-block infrastructure">
            <strong>Firm Infrastructure</strong>
            <span>{sections.supportActivities.firmInfrastructure || 'No analysis available.'}</span>
          </div>
          <div className="support-block hr">
            <strong>Human Resource Management</strong>
            <span>{sections.supportActivities.hrManagement || 'No analysis available.'}</span>
          </div>
          <div className="support-block tech">
            <strong>Technology Development</strong>
            <span>{sections.supportActivities.techDevelopment || 'No analysis available.'}</span>
          </div>
          <div className="support-block procurement">
            <strong>Procurement</strong>
            <span>{sections.supportActivities.procurement || 'No analysis available.'}</span>
          </div>
        </div>
      </div>

      {/* Primary Activities */}
      <div className="primary-activities">
        <div className="primary-block inbound">
          <strong>Inbound Logistics</strong>
          <span>{sections.primaryActivities.inboundLogistics || 'No analysis available.'}</span>
        </div>
        <div className="primary-block operations">
          <strong>Operations</strong>
          <span>{sections.primaryActivities.operations || 'No analysis available.'}</span>
        </div>
        <div className="primary-block outbound">
          <strong>Outbound Logistics</strong>
          <span>{sections.primaryActivities.outboundLogistics || 'No analysis available.'}</span>
        </div>
        <div className="primary-block marketing">
          <strong>Marketing & Sales</strong>
          <span>{sections.primaryActivities.marketingSales || 'No analysis available.'}</span>
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

      {/* Strategic Acronym */}
      <StrategicAcronym analysisResult={analysisResult} />
      
      {/* Conclusion */}
      {getConclusionText() && (
        <div className="mt-3 conclusion-text">
          {getConclusionText()}
        </div>
      )}
    </div>
  );
};

export default ValueChainMatrix;