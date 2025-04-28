import { useState, useCallback } from "react";
import { Groq } from "groq-sdk";

import { extractBCGMatrixData } from "../utils/constants";

const useAnalysis = (categories, answers, strategicPlanningBook) => {
  const [analysisResult, setAnalysisResult] = useState("");
  const [selectedAnalysisType, setSelectedAnalysisType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bcgMatrixData, setBcgMatrixData] = useState(null);

  const groqClient = new Groq({
    apiKey: process.env.REACT_APP_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const resetAnalysisResult = useCallback(() => {
    setAnalysisResult("");
    setError(null);
    setBcgMatrixData(null);
  }, []);

  const analysisNames = {
    swot: "SWOT analysis",
    porter: "Porter's Five Forces analysis",
    valuechain: "Value Chain analysis",
    bcg: "BCG Matrix analysis"
  };

  const getAnalysisSystemContent = useCallback((analysisType) => {
    const baseContent = "You are a strategic analyst. You should read the \"Strategic Planning Book\" given by the user and analyze the set of question answers and provide detailed";
    const formatInstructions = `
Your response MUST follow this exact format:

1. Start with a brief introduction paragraph.

2. Format the analysis section like this:
**${analysisType.toUpperCase()} Analysis:**
${getAnalysisFormatInstructions(analysisType)}

3. Format the STRATEGIC acronym section exactly like this:
**STRATEGIC Acronym:**
**S** - [Strategy]: [Description of action item]
**T** - [Tactics]: [Description of action item]
**R** - [Resources]: [Description of action item]
**A** - [Analytics]: [Description of action item]
**T** - [Technology]: [Description of action item]
**E** - [Execution]: [Description of action item]
**G** - [Governance]: [Description of action item]
**I** - [Innovation]: [Description of action item]
**C** - [Culture]: [Description of action item]

4. End with a conclusion paragraph starting with "By following the STRATEGIC acronym..."

DO NOT deviate from this format as it will break the component rendering the analysis.`;

    const selectedAnalysis = analysisNames[analysisType] || "SWOT analysis";
    return `${baseContent} ${selectedAnalysis} based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items. Be as detailed as possible. ${formatInstructions}`;
  }, []);

  const getAnalysisFormatInstructions = (analysisType) => {
    switch (analysisType) {
      case "swot":
        return `**Strengths:** [List the strengths identified]
        **Weaknesses:** [List the weaknesses identified]
        **Opportunities:** [List the opportunities identified]
        **Threats:** [List the threats identified]`;
              case "porter":
                return `**Supplier Power:** [Supplier power analysis]
        **Buyer Power:** [Buyer power analysis]
        **Competitive Rivalry:** [Competitive rivalry analysis]
        **Threat of Substitution:** [Threat of substitution analysis]
        **Threat of New Entry:** [Threat of new entry analysis]`;
        case "valuechain":
  return `**Primary Activities:** [Provide a concise overview of how the primary activities create value]

- Inbound Logistics: [Analyze how materials and resources are received, stored, and distributed within the organization]
- Operations: [Evaluate the processes that transform inputs into outputs/products/services]
- Outbound Logistics: [Assess the collection, storage, and distribution of products to customers]
- Marketing & Sales: [Review activities related to customer acquisition and persuasion to purchase]
- Service: [Examine activities that maintain and enhance product value after purchase]

**Support Activities:** [Provide a concise overview of how support activities strengthen primary activities]

- Firm Infrastructure: [Analyze general management, planning, finance, accounting, legal, and quality management]
- Human Resource Management: [Evaluate recruitment, development, retention, and compensation of employees]
- Technology Development: [Assess R&D, process automation, and other technological developments]
- Procurement: [Review processes for acquiring resources needed for the business]

**Margin:** [Analyze how the organization's value chain contributes to competitive advantage and profitability]

**Linkages:** [Identify key connections between activities that create additional value or reduce costs]`;
      case "bcg":
        return `**Agile Leaders (High Share / High Growth):** [Analysis]
        **Established Performers (High Share / Low Growth):** [Analysis]
        **Emerging Innovators (Low Share / High Growth):** [Analysis]
        **Strategic Drifters (Low Share / Low Growth):** [Analysis]`;
      default:
        return `**Strengths:** [List the strengths identified]
        **Weaknesses:** [List the weaknesses identified]
        **Opportunities:** [List the opportunities identified]
        **Threats:** [List the threats identified]`;
    }
  };

  const buildSurveyPrompt = useCallback(() => {
    let promptText = `Please analyze the following survey responses and provide insights:\n`;

    categories.forEach((category) => {
      category.questions.forEach((question) => {
        promptText += `\n<Question>\nMain Category: ${category.name}\n`;
        promptText += `Sub Category: ${question.nested?.question || 'N/A'}\n`;
        const answer = answers[question.id];
        promptText += `${question.question}\n`;

        if (question.type === "options" && answer && answer.selectedOption) {
          promptText += `(Choices given below)\n`;
          question.options.forEach((option) => {
            promptText += `- ${option}\n`;
          });
          promptText += `</Question>\n<Answer>\nChoice: ${answer.selectedOption}`;
          if (answer.description) {
            promptText += `\nAdditional Information: ${answer.description}</Answer>`;
          } else {
            promptText += `\n</Answer>`;
          }
        } else if (answer) {
          promptText += `</Question>\n<Answer>\n${answer.description || ""}\n</Answer>`;
        } else {
          promptText += `</Question>\n<Answer>\nNo answer provided\n</Answer>`;
        }
      });
    });

    return promptText;
  }, [categories, answers]);

  const handleAnalyzeResponses = useCallback(async () => {
    if (!selectedAnalysisType) return;
    setIsLoading(true);
    setError(null);

    try {
      setAnalysisResult(`Analyzing responses with ${selectedAnalysisType.toUpperCase()} framework...`);

      const promptText = buildSurveyPrompt();
      const systemContent = getAnalysisSystemContent(selectedAnalysisType);

      const messages = [
        { role: "system", content: systemContent },
        { role: "user", content: strategicPlanningBook + promptText }
      ];

      const chatCompletion = await groqClient.chat.completions.create({
        messages: messages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7, // Reduced from 1 to make output more consistent
        max_tokens: 31980,
        top_p: 1,
        stream: false,
        stop: null
      });

      const content = chatCompletion.choices[0].message.content;
      setAnalysisResult(content);

      if (selectedAnalysisType === 'bcg') {
        const extractedData = extractBCGMatrixData(content);
        if (extractedData) {
          setBcgMatrixData(extractedData);
        }
      }
    } catch (err) {
      console.error(`Error generating ${selectedAnalysisType} analysis:`, err);
      setError(`Error generating analysis: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAnalysisType, buildSurveyPrompt, getAnalysisSystemContent, groqClient, strategicPlanningBook]);

  return {
    analysisResult,
    selectedAnalysisType,
    setSelectedAnalysisType,
    handleAnalyzeResponses,
    resetAnalysisResult,
    isLoading,
    error,
    bcgMatrixData
  };
};

export default useAnalysis;