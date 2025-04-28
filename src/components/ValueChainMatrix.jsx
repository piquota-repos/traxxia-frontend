import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css';
import StrategicAcronym from './StrategicAcronym'; // Assuming you have this component

const ValueChainMatrix = ({ analysisResult }) => {
  const [sections, setSections] = useState({
    primaryActivities: { summary: '', items: [] },
    supportActivities: { summary: '', items: [] },
    margin: { summary: '', items: [] },
    linkages: { summary: '', items: [] },
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
      primaryActivities: { summary: '', items: [] },
      supportActivities: { summary: '', items: [] },
      margin: { summary: '', items: [] },
      linkages: { summary: '', items: [] },
    };

    const sectionTitles = ['Primary Activities', 'Support Activities', 'Margin', 'Linkages'];

    sectionTitles.forEach((title) => {
      const pattern = new RegExp(
        `\\*\\*\\s*${title}\\s*:\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*\\s*(?:${sectionTitles.join('|')}|STRATEGIC Acronym)\\s*:\\*\\*|$)`,
        'i'
      );

      const match = pattern.exec(text);

      if (match) {
        const content = match[1].trim();
        const firstParagraphEnd = content.indexOf('\n\n');
        const summary = firstParagraphEnd > -1
          ? content.substring(0, firstParagraphEnd).trim()
          : content.trim();

        let items = [];
        if (firstParagraphEnd > -1) {
          const restOfContent = content.substring(firstParagraphEnd).trim();
          items = restOfContent
            .split(/\n+/)
            .map(line => line.replace(/^[\s•\-\d.]+/, '').trim())
            .filter(item => item.length > 0);
        }

        // Update the respective section in the result
        if (title === 'Primary Activities') {
          result.primaryActivities = { summary, items };
        } else if (title === 'Support Activities') {
          result.supportActivities = { summary, items };
        } else if (title === 'Margin') {
          result.margin = { summary, items };
        } else if (title === 'Linkages') {
          result.linkages = { summary, items };
        }
      }
    })

    return result;
  };
  const getConclusionText = () => {
    if (!analysisResult) return "";

    const conclusionRegex = /By following (?:the STRATEGIC acronym|these (?:recommendations|actionable items))[\s\S]*?$/i;
    const conclusionMatch = conclusionRegex.exec(analysisResult);
    return conclusionMatch ? conclusionMatch[0] : "";
  };


  return (
    <div className="value-chain-static">
      <h4 className="text-center mb-4"><strong>Value Chain Analysis</strong></h4>

      {/* Support Activities */}
      <div className="support-activities">
        <div className="support-row">
          <div className="support-block infrastructure">
            <strong>Firm Infrastructure</strong><br />
            <span>{sections.supportActivities.summary || 'No support activities analysis available.'}</span>
          </div>
          <div className="support-block hr">
            <strong>Human Resource Management</strong><br />
            <span>{sections.supportActivities.items.join(', ') || 'No support activities items available.'}</span>
          </div>
          <div className="support-block tech">
            <strong>Technology Development</strong><br />
            <span>{sections.supportActivities.items.join(', ') || 'No support activities items available.'}</span>
          </div>
          <div className="support-block procurement">
            <strong>Procurement</strong><br />
            <span>{sections.supportActivities.items.join(', ') || 'No support activities items available.'}</span>
          </div>
        </div>
      </div>

      {/* Primary Activities */}
      <div className="primary-activities">
        <div className="primary-block inbound">
          <strong>Inbound Logistics</strong><br />
          <span>{sections.primaryActivities.summary || 'No primary activities analysis available.'}</span>
        </div>
        <div className="primary-block operations">
          <strong>Operations</strong><br />
          <span>{sections.primaryActivities.summary || 'No primary activities analysis available.'}</span>
        </div>
        <div className="primary-block outbound">
          <strong>Outbound Logistics</strong><br />
          <span>{sections.primaryActivities.summary || 'No primary activities analysis available.'}</span>
        </div>
        <div className="primary-block marketing">
          <strong>Marketing & Sales</strong><br />
          <span>{sections.primaryActivities.summary || 'No primary activities analysis available.'}</span>
        </div>
        <div className="primary-block services">
          <strong>Services</strong><br />
          <span>{sections.primaryActivities.summary || 'No primary activities analysis available.'}</span>
        </div>
      </div>

      {/* Blue Triangle with Margin and Linkages Analysis along the slanting borders */}
      <div className="blue-triangle-container">
        <div className="blue-triangle">
          {/* Content along the left slanting border */}
          <div className="margin-analysis left-slant">
            <h5>Margin Analysis</h5>
            <p>{sections.margin.summary || 'No margin analysis available.'}</p>
          </div>
          
          {/* Content along the right slanting border */}
          <div className="linkages-analysis right-slant">
            <h5>Linkages Analysis</h5>
            <p>{sections.linkages.summary || 'No linkages analysis available.'}</p>
          </div>
        </div>
      </div>

      {/* Strategic Acronym */}
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