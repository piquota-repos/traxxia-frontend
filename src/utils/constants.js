// src/utils/constants.js

// Analysis types with descriptions and icons
export const ANALYSIS_TYPES = [
    {
      id: "swot",
      name: "SWOT",
      icon: "Activity", // Lucide icon name
    },
    // {
    //   id: "pestle",
    //   name: "PESTLE",
    //   icon: "Briefcase",
    // },
    // {
    //   id: "noise",
    //   name: "NOISE",
    //   icon: "Bell",
    // },
    // {
    //   id: "vrio",
    //   name: "VRIO",
    //   icon: "PieChart",
    // },
    // {
    //   id: "bsc",
    //   name: "Balanced Scorecard",
    //   icon: "BarChart",
    // },
    {
      id: "porter",
      name: "Porter’s Five Forces",
      icon: "BarChart",
    },
    {
      id: "bcg",
      name: "BCG Matrix",
      icon: "BarChart",
    },
    {
      id: "valuechain",
      name: "Value Chain Analysis",
      icon: "BarChart",
    }
  ];
  
  // Add other constants as needed
  export const API_ENDPOINTS = {
    SURVEY_ANSWERS: '/api/survey/answers',
    SURVEY_ANSWER: '/api/survey/answer',
    DASHBOARD: '/dashboard',
    LOGIN: '/login'
  };

  const quadrantMap = {
    'Agile Leaders (High Share / High Growth)': 'Stars',
    'Established Performers (High Share / Low Growth)': 'Cash Cows',
    'Emerging Innovators (Low Share / High Growth)': 'Question Marks',
    'Strategic Drifters (Low Share / Low Growth)': 'Dogs'
  };
  
  export const extractBCGMatrixData = (analysisResult) => {
    const extractedData = {};
    const customQuadrants = Object.keys(quadrantMap);
  
    customQuadrants.forEach((label) => {
      const regex = new RegExp(`\\*\\*\\s*${label}\\s*:\\*\\*\\s*([\\s\\S]*?)(?=(\\*\\*\\s*(${customQuadrants.join('|')}|STRATEGIC Acronym|Areas for Improvement|Next Steps|Recommendations)\\s*:\\*\\*|$))`, 'i');
      const match = regex.exec(analysisResult);
  
      if (match) {
        const content = match[1].trim();
        const items = content
          .split(/\n|•|-/)
          .map(item => item.trim())
          .filter(item => item && item !== '*' && !item.startsWith('**') && item.length > 1);
  
        extractedData[quadrantMap[label]] = items;
      }
    });
  
    return extractedData;
  };
  