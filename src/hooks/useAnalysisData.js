import { useState, useCallback } from 'react';
import { Groq } from 'groq-sdk';
import { 
  getAnalysisSystemContent, 
  buildUserPrompt, 
  ANALYSIS_NAMES 
} from '../utils/analysisHelpers';

export const useAnalysisData = () => {
  const [analysisData, setAnalysisData] = useState({});
  const [analysisLoading, setAnalysisLoading] = useState({});
  
  const groqClient = new Groq({
    apiKey: process.env.REACT_APP_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
  });

// Update the generateAnalysis function in your useAnalysisData hook

const generateAnalysis = useCallback(async (analysisType, frameworkId, businessData, strategicBooks, forceRefresh = false) => {
  const cacheKey = `${frameworkId}-${analysisType}`;
  
  // IMPORTANT: Only check cache if NOT forcing refresh
  if (!forceRefresh && analysisData[cacheKey] && !analysisLoading[cacheKey]) { 
    return analysisData[cacheKey];
  }
  
  // Prevent multiple simultaneous calls for the same analysis
  if (analysisLoading[cacheKey]) { 
    return;
  }
  
  try { 
    
    setAnalysisLoading(prev => ({ ...prev, [cacheKey]: true }));
    
    // Set initial loading message
    setAnalysisData(prev => ({
      ...prev,
      [cacheKey]: `Analyzing responses with ${analysisType.toUpperCase()} framework...`
    }));

    const systemContent = getAnalysisSystemContent(analysisType);
    const userPrompt = buildUserPrompt(analysisType, businessData, strategicBooks);

    const messages = [
      { role: "system", content: systemContent },
      { role: "user", content: userPrompt }
    ];

    const chatCompletion = await groqClient.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7, // You can increase this for more variety: 0.8 or 0.9
      max_tokens: 31980,
      top_p: 1,
      stream: false,
      stop: null
    });

    const content = chatCompletion.choices[0].message.content;
    
    setAnalysisData(prev => ({
      ...prev,
      [cacheKey]: content
    }));
     
    return content;
  } catch (error) {
    console.error('❌ Error generating analysis:', error);
    const errorMessage = `Error generating ${analysisType} analysis: ${error.message}`;
    
    setAnalysisData(prev => ({
      ...prev,
      [cacheKey]: errorMessage
    }));
    
    return errorMessage;
  } finally {
    setAnalysisLoading(prev => ({ ...prev, [cacheKey]: false }));
  }
}, [analysisData, analysisLoading, groqClient]);

  // Clear cache function (optional - for manual cache clearing)
  const clearAnalysisCache = useCallback((cacheKey = null) => {
    if (cacheKey) {
      setAnalysisData(prev => {
        const newData = { ...prev };
        delete newData[cacheKey];
        return newData;
      }); 
    } else {
      setAnalysisData({}); 
    }
  }, []);

  return {
    analysisData,
    analysisLoading,
    generateAnalysis,
    clearAnalysisCache,
    setAnalysisData,
    setAnalysisLoading
  };
};