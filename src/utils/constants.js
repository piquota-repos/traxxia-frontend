// src/utils/constants.js

// Analysis types with descriptions and icons
export const ANALYSIS_TYPES = [
    {
      id: "swot",
      name: "SWOT",
      icon: "Activity", // Lucide icon name
    },
    {
      id: "pestle",
      name: "PESTLE",
      icon: "Briefcase",
    },
    {
      id: "noise",
      name: "NOISE",
      icon: "Bell",
    },
    {
      id: "vrio",
      name: "VRIO",
      icon: "PieChart",
    },
    {
      id: "bsc",
      name: "Balanced Scorecard",
      icon: "BarChart",
    },
  ];
  
  // Add other constants as needed
  export const API_ENDPOINTS = {
    SURVEY_ANSWERS: '/api/survey/answers',
    SURVEY_ANSWER: '/api/survey/answer',
    DASHBOARD: '/dashboard',
    LOGIN: '/login'
  };