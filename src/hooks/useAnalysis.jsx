import { useState, useCallback } from "react";
import { Groq } from "groq-sdk";

const useAnalysis = (categories, answers, strategicPlanningBook) => {
  const [analysisResult, setAnalysisResult] = useState("");
  const [selectedAnalysisType, setSelectedAnalysisType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const groqClient = new Groq({
    apiKey: process.env.REACT_APP_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const resetAnalysisResult = useCallback(() => {
    setAnalysisResult("");
    setError(null);
  }, []);

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
    
    switch (analysisType) {
      case "swot":
        return `${baseContent} SWOT analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items. Be as detailed as possible. ${formatInstructions}`;
      case "pestle":
        return `${baseContent} PESTLE analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items. Be as detailed as possible. ${formatInstructions}`;
      case "noise":
        return `${baseContent} NOISE analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items. Be as detailed as possible. ${formatInstructions}`;
      case "vrio":
        return `${baseContent} VRIO analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items. Be as detailed as possible. ${formatInstructions}`;
      case "bsc":
        return `${baseContent} Balanced Scorecard analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items. Be as detailed as possible. ${formatInstructions}`;
      default:
        return `${baseContent} SWOT analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items. Be as detailed as possible. ${formatInstructions}`;
    }
  }, []);
  
  const getAnalysisFormatInstructions = (analysisType) => {
    switch (analysisType) {
      case "swot":
        return `**Strengths:** [List the strengths identified]
**Weaknesses:** [List the weaknesses identified]
**Opportunities:** [List the opportunities identified]
**Threats:** [List the threats identified]`;
      case "pestle":
        return `**Political:** [Political factors analysis]
**Economic:** [Economic factors analysis]
**Social:** [Social factors analysis]
**Technological:** [Technological factors analysis]
**Legal:** [Legal factors analysis]
**Environmental:** [Environmental factors analysis]`;
      case "noise":
        return `**Need:** [Need analysis]
**Opportunity:** [Opportunity analysis]
**Issue:** [Issue analysis] 
**Solution:** [Solution analysis]
**Expectation:** [Expectation analysis]`;
      case "vrio":
        return `**Valuable:** [Value analysis]
**Rare:** [Rarity analysis]
**Imitable:** [Imitability analysis]
**Organized:** [Organization analysis]`;
      case "bsc":
        return `**Financial Perspective:** [Financial analysis]
**Customer Perspective:** [Customer analysis]
**Internal Processes Perspective:** [Internal processes analysis]
**Learning and Growth Perspective:** [Learning and growth analysis]`;
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
  };
};

export default useAnalysis;