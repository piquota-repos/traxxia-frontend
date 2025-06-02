import { useState, useCallback } from "react";
import { Groq } from "groq-sdk";

import { extractBCGMatrixData } from "../utils/constants";

const useAnalysis = (categories, answers, strategicPlanningBook, strategicPlanningBook1) => {
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
    swot: "SWOT",
    porter: "Porter's Five Forces",
    valuechain: "Value Chain",
    bcg: "BCG Matrix",
    strategic: "STRATEGIC"
  };

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

  const getAnalysisSystemContent = useCallback((analysisType) => {
    if (analysisType === 'strategic') {
      return `You are a strategic analyst. Your task is to read the Strategic Planning Book (Parts 1 and 2) provided by the user and analyze their question-answer responses to deliver a detailed ${analysisNames[analysisType]} analysis. This analysis will help the user understand the next steps in their strategic planning process.

Your response MUST follow this exact format:

1. Start with a brief introduction paragraph about strategic planning.

2. Provide specific actionable recommendations using the STRATEGIC framework:

S = Strategy: Defining a clear vision, mission, and objectives
* Theory: Strategy sets the organizational north star. Without a clear vision, actions lack cohesion and direction.
* Example: Early on, Amazon defined its vision as "to be Earth's most customer-centric company." This focus has guided all decisions, from creating Amazon Prime to innovating in logistics.
 
T = Tactics: Translating vision into concrete actions
* Theory: Tactics are the specific activities needed to execute the strategy.
* Example: Spotify uses "squads"—small, cross-functional teams—to develop new features quickly. This lets them release multiple updates each month, responding swiftly to user needs.
 
R = Resources: Prioritizing capital, talent, and technology
* Theory: Efficient resource allocation maximizes the impact of each investment.
* Example: In 2024, Nubank invested 20% of its annual budget in cloud technology, reducing operating costs by 30%.
 
A = Analysis and Data: Insights-based decision-making
* Theory: Data analysis allows organizations to anticipate trends and fine-tune strategies in real time.
* Example: Netflix uses advanced algorithms to analyze millions of hours of viewed content, enabling them to produce series like Stranger Things with a high degree of certainty of success.
 
T = Technology and Digitization: Automation and AI as accelerators
* Theory: Technology not only streamlines processes but also uncovers new business opportunities.
* Example: Tesla developed its own autonomous driving software, differentiating itself from competitors and capturing 80% of the electric vehicle market in 2023.
 
E = Execution: Rigorous implementation and constant monitoring
* Theory: Without effective execution, even the best strategy is doomed.
* Example: During its global launch, Disney+ employed a disciplined approach, achieving 100 million subscribers in under two years.
 
G = Governance: Clear structures for decision-making
* Theory: Effective governance ensures agile, transparent decisions aligned with strategy.
* Example: At Mercado Libre, strategic decisions are made within "leadership capsules," speeding up response times.
 
I = Innovation: A culture of experimentation
* Theory: Ongoing innovation is crucial to remain competitive.
* Example: Google's "20% time" policy lets employees spend one day a week on innovative projects, spawning Gmail and Google Maps.
 
C = Culture: Aligning organizational values with strategic objectives
* Theory: Organizational culture is the glue that binds every aspect of the STRATEGIC model together.
* Example: Patagonia, with its emphasis on sustainability, has aligned its entire operation around environmental values, attracting both customers and employees committed to its mission.

Your analysis should be comprehensive, actionable, and tailored to the user's specific business context. Be detailed and insightful in your recommendations.`;
    }

    // For all other analysis types (no STRATEGIC framework)
    return `You are a strategic analyst. Your task is to read the Strategic Planning Book (Parts 1 and 2) provided by the user and analyze their question-answer responses to deliver a detailed ${analysisNames[analysisType]} analysis. This analysis will help the user understand their current strategic position and identify key areas for improvement.

Your response MUST follow this exact format:

1. Start with a brief introduction paragraph.

2. Format the analysis section like this:
**${analysisNames[analysisType].toUpperCase()} Analysis:**
${getAnalysisFormatInstructions(analysisType)}

3. End with a conclusion paragraph with actionable recommendations.

Your analysis should be comprehensive, actionable, and tailored to the user's specific business context. Be detailed and insightful in your recommendations.`;
  }, []);

  const buildUserPrompt = useCallback(() => {
    let userQA = `Please analyze the following survey responses and provide insights:\n`;

    categories.forEach((category) => {
      category.questions.forEach((question) => {
        userQA += `\n<Question>\nMain Category: ${category.name}\n`;
        userQA += `Sub Category: ${question.nested?.question || 'N/A'}\n`;
        const answer = answers[question.id];
        userQA += `${question.question}\n`;

        if (question.type === "options" && answer && answer.selectedOption) {
          userQA += `(Choices given below)\n`;
          question.options.forEach((option) => {
            userQA += `- ${option}\n`;
          });
          userQA += `</Question>\n<Answer>\nChoice: ${answer.selectedOption}`;
          if (answer.description) {
            userQA += `\nAdditional Information: ${answer.description}</Answer>`;
          } else {
            userQA += `\n</Answer>`;
          }
        } else if (answer) {
          userQA += `</Question>\n<Answer>\n${answer.description || ""}\n</Answer>`;
        } else {
          userQA += `</Question>\n<Answer>\nNo answer provided\n</Answer>`;
        }
      });
    });

    if (selectedAnalysisType === 'strategic') {
      return `Please analyze my business situation and provide:

1. A comprehensive ${analysisNames[selectedAnalysisType]} analysis based on the information below
2. Specific actionable recommendations using the S.T.R.A.T.E.G.I.C framework

Strategic Planning Book:
Part 1: ${strategicPlanningBook}
Part 2: ${strategicPlanningBook1}

My Business Context (Questions and Answers):
${userQA}

Please ensure your analysis is detailed and your recommendations are practical and implementable for my specific business situation.`;
    }

    // For all other analysis types (no STRATEGIC framework)
    return `Please analyze my business situation and provide a comprehensive ${analysisNames[selectedAnalysisType]} analysis based on the information below.

Strategic Planning Book:
Part 1: ${strategicPlanningBook}
Part 2: ${strategicPlanningBook1}

My Business Context (Questions and Answers):
${userQA}

Please ensure your analysis is detailed and your recommendations are practical and implementable for my specific business situation.`;
  }, [categories, answers, selectedAnalysisType, strategicPlanningBook, strategicPlanningBook1]);

  const handleAnalyzeResponses = useCallback(async () => {
    if (!selectedAnalysisType) return;
    setIsLoading(true);
    setError(null);

    try {
      setAnalysisResult(`Analyzing responses with ${selectedAnalysisType.toUpperCase()} framework...`);

      const systemContent = getAnalysisSystemContent(selectedAnalysisType);
      const userPrompt = buildUserPrompt();

      const messages = [
        { role: "system", content: systemContent },
        { role: "user", content: userPrompt }
      ];

      const chatCompletion = await groqClient.chat.completions.create({
        messages: messages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
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
  }, [selectedAnalysisType, buildUserPrompt, getAnalysisSystemContent, groqClient]);

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