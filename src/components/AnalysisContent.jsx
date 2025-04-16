import React from "react";
import { Badge, ProgressBar } from "react-bootstrap";
import {
  Activity,
  Briefcase,
  Bell,
  PieChart,
  BarChart,
  X, // Added X icon for close button
} from "lucide-react";
import "../styles/Dashboard.css";
import { CheckCircle } from "react-bootstrap-icons";

const analysisIcons = {
  swot: Activity,
  pestle: Briefcase,
  noise: Bell,
  vrio: PieChart,
  bsc: BarChart,
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
}) => {
  const handleAnalysisTypeSelect = (typeId) => {
    onResetAnalysisResult();
    onAnalysisTypeSelect(typeId);
  };

  return (
    <div className="analysis-container p-4">
      {/* Added close button at the top */}
      <div
        className="modal-close-button"
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        <X
          size={24}
          onClick={onClose}
          className="text-muted hover:text-gray-700"
        />
      </div>

      {loading ? (
        <div className="text-center analysis-loading">
          <h5 className="mb-3 text-muted">Analyzing Your Responses</h5>
          <ProgressBar
            animated
            now={75}
            variant="primary"
            className="analysis-progress"
          />
        </div>
      ) : (
        <div className="analysis-results">
          <div className="analysis-header mb-4">
            <div className="d-flex justify-content-center align-items-center">
              {analysisTypes.map((type) => {
                const Icon = analysisIcons[type.id];
                const isSelected = selectedAnalysisType === type.id;
                return (
                  <div
                    key={type.id}
                    className={`analysis-type-pill ${
                      isSelected ? "selected" : ""
                    }`}
                    title={type.name}
                    onClick={() => handleAnalysisTypeSelect(type.id)}
                  >
                    <div className="icon-wrapper">
                      <Icon
                        size={20}
                        className={`analysis-icon ${
                          isSelected ? "text-primary" : "text-muted"
                        }`}
                      />
                      <p>{type.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {selectedAnalysisType && (
            <div className="text-center mt-3">
              <button
                className="btn btn-primary"
                onClick={onAnalyzeResponses}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Generate Analysis"}
              </button>
            </div>
          )}
          <br></br>
          <div
            className="analysis-content"
            style={{
              whiteSpace: "pre-line",
              maxHeight: "500px",
              overflowY: "auto",
              backgroundColor: "#f8f9fa",
              borderRadius: "10px",
              padding: "20px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            {selectedAnalysisType === "pestle" &&
            typeof analysisResult === "string" ? (
              (() => {
                const pestleRegex =
                  /\*\*\s*PESTLE Analysis\s*:\*\*([\s\S]*?)(?=\*\*\s*(Areas for Improvement|STRATEGIC Acronym|Next Steps|Recommendations)\s*:\*\*|$)/i;
                const match = pestleRegex.exec(analysisResult);
                const pestleBlock = match ? match[1].trim() : "";

                const introText = match
                  ? analysisResult.slice(0, match.index).trim()
                  : "";

                const afterRegex =
                  /\*\*\s*(Areas for Improvement|Next Steps|STRATEGIC Acronym|Recommendations)\s*:\*\*([\s\S]*)/i;
                const afterMatch = afterRegex.exec(analysisResult);
                const afterText = afterMatch ? afterMatch[0].trim() : "";

                const pestleData = {};
                const sectionRegex =
                  /\*\*\s*(Political|Economic|Social|Technological|Legal|Environmental)\s*:\*\*\s*([\s\S]*?)(?=(\*\*\s*(Political|Economic|Social|Technological|Legal|Environmental|STRATEGIC Acronym|Areas for Improvement|Next Steps|Recommendations)\s*:\*\*|$))/gi;

                let m;
                while ((m = sectionRegex.exec(pestleBlock)) !== null) {
                  const key = m[1];
                  const value = m[2]
                    .split(/\n(?=\*\*|\d+\.\s)/)[0]
                    .trim()
                    .replace(/\n/g, "<br/>");
                  pestleData[key] = value;
                }

                const labels = Object.keys(pestleData);

                const hasContent =
                  introText?.trim() || labels.length > 0 || afterText?.trim();

                return hasContent ? (
                  <>
                    {introText && <div className="mb-3">{introText}</div>}

                    {labels.length > 0 && (
                      <>
                        <h5 className="mb-3">
                          <strong>PESTLE Analysis Table</strong>
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
                                    {pestleData[label]
                                      .split(
                                        /<br\s*\/?>\s*(?=<br\s*\/?>|[^<])/i
                                      )
                                      .filter((para) => para.trim() !== "")
                                      .map((para, idx) => {
                                        const bgClass = `${label.toLowerCase()}-bg`;
                                        return (
                                          <div
                                            key={idx}
                                            className={`pestle-box ${bgClass}`}
                                            dangerouslySetInnerHTML={{
                                              __html: para,
                                            }}
                                          />
                                        );
                                      })}
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
                ) : (
                  <div>No analysis results available.</div>
                );
              })()
            ) : (
              <div>
                {analysisResult?.trim()
                  ? analysisResult
                  : "No analysis results available."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisContent;
