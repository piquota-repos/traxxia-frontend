import { useState, useCallback } from "react";
import { Groq } from "groq-sdk";

import { extractBCGMatrixData } from "../utils/constants";
import analysisConfig from "../utils/analysisConfig.json";

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

  const getAnalysisSystemContent = useCallback((analysisType) => {
    const actualAnalysisType = analysisConfig[analysisType] ? analysisType : analysisConfig.system.defaultAnalysisType;
    const analysisName = analysisConfig[actualAnalysisType].name;
    
    // Use analysisType instead of selectedAnalysisType
    const formattedInstructions = analysisConfig.system.formatInstructionsTemplate
      .replace('{analysisType}', analysisType.toUpperCase())
      .replace('{formatInstructions}', analysisConfig[analysisType].formatInstructions)
      .replace('{strategicFormat}', analysisConfig.shared.strategicFormat); 
      
    const systemContent = analysisConfig.system.responseTemplate
      .replace('{baseContent}', analysisConfig.system.baseContent)
      .replace('{analysisName}', analysisType)
      .replace('{formatInstructions}', formattedInstructions);
      
    return systemContent;
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
      const loadingMessage = analysisConfig.system.defaultLoadingMessage.replace('{analysisType}', selectedAnalysisType.toUpperCase());
      setAnalysisResult(loadingMessage);

      const promptText = buildSurveyPrompt();
      const systemContent = getAnalysisSystemContent(selectedAnalysisType);

      const messages = [
        { role: "system", content: systemContent },
        { role: "user", content: strategicPlanningBook + promptText }
      ];

      const chatCompletion = await groqClient.chat.completions.create({
        messages: messages,
        model: analysisConfig.system.model,
        temperature: analysisConfig.system.temperature,
        max_tokens: analysisConfig.system.maxTokens,
        top_p: analysisConfig.system.topP,
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
  }, [selectedAnalysisType, buildSurveyPrompt, groqClient, strategicPlanningBook]);

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