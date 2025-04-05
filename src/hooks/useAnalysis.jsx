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
    const endContent = "analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items. Be as detailed as possible";
    
    switch (analysisType) {
      case "swot":
        return `${baseContent} SWOT ${endContent}`;
      case "pestle":
        return `${baseContent} PESTLE ${endContent}`;
      case "noise":
        return `${baseContent} NOISE ${endContent}`;
      case "vrio":
        return `${baseContent} VRIO ${endContent}`;
      case "bsc":
        return `${baseContent} Balanced Scorecard ${endContent}`;
      default:
        return `${baseContent} SWOT ${endContent}`;
    }
  }, []);

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

      setAnalysisResult("");

      const chatCompletion = await groqClient.chat.completions.create({
        messages: messages,
        model: "llama-3.3-70b-versatile",
        temperature: 1,
        max_tokens: 31980,
        top_p: 1,
        stream: true,
        stop: null
      });

      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || '';
        setAnalysisResult((prevResult) => prevResult + content);
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
    setSelectedAnalysisType,
    handleAnalyzeResponses,
    resetAnalysisResult,
    isLoading,
    error,
  };
};

export default useAnalysis;
