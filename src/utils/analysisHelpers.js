export const ANALYSIS_NAMES = {
  swot: "SWOT",
  porter: "Porter's Five Forces",
  valuechain: "Value Chain",
  bcg: "BCG Matrix",
  strategic: "STRATEGIC"  
};

export const ANALYSIS_ICONS = {
  strategic: 'Users',
  swot: 'Target',  
  porter: 'BarChart3',
  valuechain: 'Zap',
  bcg: 'TrendingUp'
};

export const getAnalysisFormatInstructions = (analysisType) => {
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
    case "pestle":
      return `**Political:** [Political factors analysis]
      **Economic:** [Economic factors analysis]
      **Social:** [Social factors analysis]
      **Technological:** [Technological factors analysis]
      **Legal:** [Legal factors analysis]
      **Environmental:** [Environmental factors analysis]`;
    default:
      return `**Strengths:** [List the strengths identified]
      **Weaknesses:** [List the weaknesses identified]
      **Opportunities:** [List the opportunities identified]
      **Threats:** [List the threats identified]`;
  }
};

export const getAnalysisSystemContent = (analysisType) => {
  if (analysisType === 'strategic') {
    return `You are a strategic analyst. Your task is to read the Strategic Planning Book (Parts 1 and 2) provided by the user and analyze their question-answer responses to deliver a detailed ${ANALYSIS_NAMES[analysisType]} analysis. This analysis will help the user understand the next steps in their strategic planning process.

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
  return `You are a strategic analyst. Your task is to read the Strategic Planning Book (Parts 1 and 2) provided by the user and analyze their question-answer responses to deliver a detailed ${ANALYSIS_NAMES[analysisType]} analysis. This analysis will help the user understand their current strategic position and identify key areas for improvement.

Your response MUST follow this exact format:

1. Start with a brief introduction paragraph.

2. Format the analysis section like this:
**${ANALYSIS_NAMES[analysisType].toUpperCase()} Analysis:**
${getAnalysisFormatInstructions(analysisType)}

3. End with a conclusion paragraph with actionable recommendations.

Your analysis should be comprehensive, actionable, and tailored to the user's specific business context. Be detailed and insightful in your recommendations.`;
};

export const buildUserPrompt = (selectedType, businessData, strategicBooks) => {
  let userQA = `Please analyze the following survey responses and provide insights:\n`;

  if (businessData?.categories) {
    businessData.categories.forEach((category) => {
      category.questions.forEach((question) => {
        userQA += `\n<Question>\nMain Category: ${category.name}\n`;
        userQA += `Sub Category: ${question.nested?.question || question.placeholder || 'N/A'}\n`;
        userQA += `${question.title || question.question}\n`;
        
        if (question.type === "options" && question.answer && question.answer.selectedOption) {
          userQA += `(Choices given below)\n`;
          if (question.options) {
            question.options.forEach((option) => {
              userQA += `- ${option}\n`;
            });
          }
          userQA += `</Question>\n<Answer>\nChoice: ${question.answer.selectedOption}`;
          if (question.answer.description) {
            userQA += `\nAdditional Information: ${question.answer.description}</Answer>`;
          } else {
            userQA += `\n</Answer>`;
          }
        } else if (question.answer) {
          userQA += `</Question>\n<Answer>\n${question.answer.description || question.answer || ""}\n</Answer>`;
        } else {
          userQA += `</Question>\n<Answer>\nNo answer provided\n</Answer>`;
        }
      });
    });
  }

  if (selectedType === 'strategic') {
    return `Please analyze my business situation and provide:

1. A comprehensive ${ANALYSIS_NAMES[selectedType]} analysis based on the information below
2. Specific actionable recommendations using the S.T.R.A.T.E.G.I.C framework

Strategic Planning Book:
Part 1: ${strategicBooks.part1}
Part 2: ${strategicBooks.part2}

My Business Context (Questions and Answers):
${userQA}

Please ensure your analysis is detailed and your recommendations are practical and implementable for my specific business situation.`;
  }

  // For all other analysis types (no STRATEGIC framework)
  return `Please analyze my business situation and provide a comprehensive ${ANALYSIS_NAMES[selectedType]} analysis based on the information below.

Strategic Planning Book:
Part 1: ${strategicBooks.part1}
Part 2: ${strategicBooks.part2}

My Business Context (Questions and Answers):
${userQA}

Please ensure your analysis is detailed and your recommendations are practical and implementable for my specific business situation.`;
};

export const transformBusinessData = (data, businessName) => {
  return {
    name: data.user?.company || businessName || "Business Name",
    totalQuestions: data.survey?.total_questions || 0,
    categories: data.categories?.map(category => ({
      id: `category-${category.category_id}`,
      name: category.category_name,
      questions: category.questions?.map(question => ({
        id: question.question_id,
        title: question.question_text,
        question: question.question_text,
        placeholder: question.nested?.question || question.question_text,
        answer: question.user_answer?.answer || "",
        type: question.type || "text",
        options: question.options || [],
        nested: question.nested || null
      })) || []
    })) || [],
    analysisItems: [
      {
        id: "swot",
        title: "SWOT",
        subtitle: "Strengths, weaknesses, opportunities, and threats",
        icon: "Target",
        category: "analysis"
      },
      {
        id: "porters",
        title: "Porter's Five Forces",
        subtitle: "Industry analysis framework",
        icon: "BarChart3",
        category: "analysis"
      },
      {
        id: "bcg",
        title: "BCG Matrix",
        subtitle: "Portfolio analysis tool for strategic planning",
        icon: "TrendingUp",
        category: "analysis"
      },
      {
        id: "value-chain",
        title: "Value Chain",
        subtitle: "Activities that create value in your organization",
        icon: "Zap",
        category: "analysis"
      },
      {
        id: "strategic",
        title: "STRATEGIC Framework", 
        subtitle: "Comprehensive strategic analysis",
        icon: "Users",
        category: "strategic"
      }
    ]
  };
};

export const getErrorMessage = (err) => {
  if (err.response?.status === 404) {
    return 'No survey responses found. Please complete the survey first.';
  } else if (err.response?.status === 401 || err.response?.status === 403) {
    return 'Authentication failed. Please log in again.';
  } else {
    return err.response?.data?.message || 'Failed to load business data. Please try again.';
  }
};

export const getAnalysisType = (itemId) => {
  return itemId === 'porters' ? 'porter' : 
         itemId === 'value-chain' ? 'valuechain' : 
         itemId;
};