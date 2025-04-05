import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Delta } from "quill";
import {
  Card,
  Button,
  Modal,
  Form,
  Container,
  Row,
  Col,
  Accordion,
  Navbar,
  Nav,
  Dropdown,
  Badge, Toast,
  ToastContainer,
  Collapse
} from "react-bootstrap";
import {
  LogOut,
  Eye,
  BarChart,
  CheckCircle,
  FileText,
  PieChart,
  Settings,
  Bell,
  Search,
  Zap,
  Briefcase,
  Activity,
  ChevronRight,
  CircleUserRound
} from "lucide-react";
import { ChevronDown, ChevronUp } from "react-bootstrap-icons";
import useGroqChat from "../components/GroqChat";
import "../styles/Dashboard.css";
import questionsData from "../utils/questions.json";
import strategicPlanningBook from "../utils/strategicPlanningBook.js";
import { Groq } from "groq-sdk";
import axios from 'axios';
import PreviewContent from "@/components/PreviewContent";
import AnalysisContent from "../components/AnalysisContent";
import FormattedContentViewer from '../components/FormattedContentViewer'

const Dashboard = () => {
  const [categories, setCategories] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [saveAnswers, setSaveAnswers] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [username, setUsername] = useState("");
  const [activeSection, setActiveSection] = useState("survey");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState(null);
  const [showAnalysisSelection, setShowAnalysisSelection] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");



  const navigate = useNavigate();
  const { loading } = useGroqChat();
  const groqClient = new Groq({
    apiKey: process.env.REACT_APP_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
  });
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  // Analysis types with descriptions
  const analysisTypes = [
    {
      id: "swot",
      name: "SWOT",
      // description: "Strengths, Weaknesses, Opportunities, and Threats analysis",
      icon: <Activity size={24} />,
    },
    {
      id: "pestle",
      name: "PESTLE",
      // description: "Political, Economic, Social, Technological, Legal and Environmental factors",
      icon: <Briefcase size={24} />,
    },
    {
      id: "noise",
      name: "NOISE",
      // description: "Needs, Opportunities, Improvements, Strengths, and Exceptions",
      icon: <Bell size={24} />,
    },
    {
      id: "vrio",
      name: "VRIO",
      // description: "Value, Rarity, Imitability, and Organization",
      icon: <PieChart size={24} />,
    },
    {
      id: "bsc",
      name: "Balanced Scorecard",
      // description: "Financial, Customer, Internal Process, and Learning & Growth perspectives",
      icon: <BarChart size={24} />,
    },
  ];
  const handleResetAnalysisResult = () => {
    setAnalysisResult(""); // Reset analysis result
  };
  // In your Dashboard component, modify the existing code:

  const handleDescriptionChange = (questionId, newDescription) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        description: newDescription,
      },
    }));
  };

  const handleSaveDescription = async (questionId) => {
    try {
      const description = answers[questionId]?.description || "";
      const selectedOption = answers[questionId]?.selectedOption || "";

      // Find the category for this question
      let categoryId = "";
      for (const category of categories) {
        const foundQuestion = category.questions.find(q => q.id === questionId);
        if (foundQuestion) {
          categoryId = category.id;
          break;
        }
      }

      const response = await axios.post(`${API_BASE_URL}/api/survey/answer`,
        {
          [questionId]: {
            question_id: questionId,
            category_id: categoryId,
            description: description,
            selectedOption: selectedOption
          }
        },
        {
          headers: {
            'Authorization': localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        }
      );

      alert(`Description saved for question ${questionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error saving description for question ${questionId}:`, error);
      alert(`Failed to save description: ${error.response?.data?.message || error.message}`);
      throw error;
    }
  };
  const quillRefs = useRef({});

  const convertFormattedTextToHTML = (text) => {
    // First, handle any escaped newlines
    let converted = text.replace(/\\n/g, '\n');

    // Split the text into lines
    const lines = converted.split('\n');
    let formattedContent = '';
    let inOrderedList = false;
    let inUnorderedList = false;
    let previousNumberedValue = 0; // Track the previous number for sequence detection

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Check for numbered list item (e.g., "1. Item")
      const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);

      if (numberedMatch) {
        const currentNumber = parseInt(numberedMatch[1], 10);

        // Check if this is a new list or continuation of the existing one
        if (!inOrderedList || (currentNumber !== previousNumberedValue + 1 && currentNumber !== 1)) {
          // If we're already in a list and the sequence is broken, close it
          if (inOrderedList) {
            formattedContent += '</ol>';
          }

          // Start a new ordered list
          formattedContent += '<ol>';
          inOrderedList = true;
          inUnorderedList = false;
        }

        // Add the list item
        formattedContent += `<li>${numberedMatch[2]}</li>`;
        previousNumberedValue = currentNumber;
      }
      // Check for bullet points
      else if (/^[●\*\-•]\s/.test(line)) {
        if (inOrderedList) {
          // Close the ordered list if we're switching to unordered
          formattedContent += '</ol>';
          inOrderedList = false;
        }

        if (!inUnorderedList) {
          // Start a new unordered list
          formattedContent += '<ul>';
          inUnorderedList = true;
        }

        // Add the bullet point as a list item
        const bulletContent = line.replace(/^[●\*\-•]\s/, '');
        formattedContent += `<li>${bulletContent}</li>`;
      }
      else {
        // Regular text - close any open lists
        if (inOrderedList) {
          formattedContent += '</ol>';
          inOrderedList = false;
        }

        if (inUnorderedList) {
          formattedContent += '</ul>';
          inUnorderedList = false;
        }

        // Add as regular paragraph
        formattedContent += `<p>${line}</p>`;
      }
    }

    // Close any open lists
    if (inOrderedList) {
      formattedContent += '</ol>';
    }

    if (inUnorderedList) {
      formattedContent += '</ul>';
    }

    return formattedContent;
  };
  const registerQuillRef = (questionId, quillInstance) => {
    if (quillInstance) {
      const quill = quillInstance.getEditor();
      quillRefs.current[questionId] = quill;

      // Add direct paste event listener to the quill element
      quill.root.addEventListener('paste', function (e) {
        // Don't completely prevent default as we still want paste to work
        // But we'll intercept the plain text content

        // Get text from clipboard
        const text = e.clipboardData.getData('text/plain');
        if (text) {
          // Stop the default paste
          e.preventDefault();

          // Convert the text
          const formattedHTML = convertFormattedTextToHTML(text);

          // Get selection range
          const range = quill.getSelection();
          if (range) {
            // Insert the formatted HTML at cursor position
            quill.clipboard.dangerouslyPasteHTML(range.index, formattedHTML);
          } else {
            // If no selection, append to the end
            quill.clipboard.dangerouslyPasteHTML(quill.getLength(), formattedHTML);
          }
        }
      });
    }
  };

  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      ["link", "image", "video", "formula"],
      [{ header: 1 }, { header: 2 }],
      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
    ],
    clipboard: {
      matchVisual: false
    }
  };

  const renderQuillEditor = (questionId) => (
    <ReactQuill
      theme="snow"
      value={answers[questionId]?.description || ""}
      onChange={(content) => handleDescriptionChange(questionId, content)}
      className="modern-textarea"
      modules={modules}
      ref={(el) => registerQuillRef(questionId, el)}
    />
  );
  const fetchSavedAnswers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/survey/answers`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.answers) {
        const savedAnswers = {};

        Object.entries(response.data.answers).forEach(([questionId, answer]) => {
          savedAnswers[questionId] = {
            description: convertFormattedTextToHTML(answer.description) || "",
            selectedOption: answer.selectedOption || ""
          };
        });
        setAnswers(prevAnswers => ({
          ...prevAnswers,
          ...savedAnswers
        }));
      }
    } catch (error) {
      console.error("Error fetching saved answers:", error);

      if (error.response && error.response.status === 401) {
        alert("Unauthorized. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const showToastNotification = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleSaveAllAnswers = async (showToaster = false) => {
    try {
      const answersToSave = Object.entries(answers).map(([questionId, answer]) => {
        let categoryId = "";
        for (const category of categories) {
          const foundQuestion = category.questions.find(q => q.id === questionId);
          if (foundQuestion) {
            categoryId = category.id;
            break;
          }
        }

        return {
          question_id: questionId,
          category_id: categoryId,
          selectedOption: answer.selectedOption || "",
          description: answer.description || ""
        };
      });

      const response = await axios.post(`${API_BASE_URL}/api/survey/answers`,
        { answers: answersToSave },
        {
          headers: {
            'Authorization': localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        }
      );

      if (showToaster) {
        showToastNotification("All survey answers saved successfully!");
      }

      return response.data;
    } catch (error) {
      console.error("Error saving all answers:", error);

      if (showToaster) {
        showToastNotification(
          `Failed to save all answers: ${error.response?.data?.message || error.message}`,
          "danger"
        );
      }

      throw error;
    }
  };

  // Modify your existing useEffect to call this function
  useEffect(() => {
    const setupQuestions = () => {
      try {
        // Set the categories from the imported JSON file
        setCategories(questionsData);

        // Initialize answers structure
        const initialAnswers = {};
        questionsData.forEach((category) => {
          category.questions.forEach((question) => {
            initialAnswers[question.id] = {
              description: "",
              selectedOption: question.type === "options" ? "" : null,
            };
          });
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error("Error setting up questions:", error);
      }
    };


    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Unauthorized access. Please log in.");
        navigate("/login");
        return;
      }

      try {
        // Fetch user dashboard data
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
          headers: { Authorization: token },
        });
        if (!response.ok) throw new Error("Failed to fetch data");

        const userData = await response.json();
        setUsername(userData.user?.name || "User");

        // Fetch saved answers
        await fetchSavedAnswers();
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("Error fetching data");
        navigate("/login");
      }
    };

    setupQuestions();
    fetchData();
  }, [navigate]);

  const [activeQuestionId, setActiveQuestionId] = useState(null);

  // Add this function to handle accordion changes
  const handleAccordionChange = async (questionId) => {
    if (activeQuestionId && activeQuestionId !== questionId) {
      await handleSaveAllAnswers(false);
    }
    setActiveQuestionId(questionId);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleOptionChange = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOption: option,
        description: "",
      },
    }));
  };

  const isQuestionCompleted = (questionId) => {
    const answer = answers[questionId];
    if (!answer) return false;

    return (
      (answer.description &&
        answer.description.replace(/<(.|\n)*?>/g, "").trim() !== "") ||
      (answer.selectedOption && answer.selectedOption !== "")
    );
  };
  const allQuestionsAnswered = () => {
    // Ensure all categories and their questions are answered
    return categories.every((category) =>
      category.questions.every((question) =>
        isQuestionCompleted(question.id)
      )
    );
  };

  const getProgressPercentage = () => {
    if (Object.keys(answers).length === 0) return 0;

    const completedCount = Object.keys(answers).filter((questionId) =>
      isQuestionCompleted(questionId)
    ).length;

    return Math.round((completedCount / Object.keys(answers).length) * 100);
  };

  const handleAnalyzeResponses = async () => {
    await handleSaveAllAnswers();
    setShowAnalysisSelection(false);
    setShowAnalysis(true);
    let promptText = `Please analyze the following survey responses and provide insights:\n`;

    categories.forEach((category) => {
      category.questions.forEach((question) => {
        promptText += `\n<Question>\nMain Category: ${category.name}\n`;
        promptText += `Sub Category: ${question.nested.question}\n`;
        const answer = answers[question.id];
        promptText += `${question.question}\n`;
        if (question.type === "options" && answer.selectedOption) {
          promptText += `(Choices given below)\n`;
          question.options.forEach((option) => {
            promptText += `-${option}\n`;
          })
          promptText += `</Question>\n<Answer>\nChoice:${answer.selectedOption}`;
          if (answer.description) {
            promptText += `\nAdditional information:${answer.description}</Answer>`;
          } else {
            promptText += `\n</Answer>`;
          }
        } else {
          promptText += `</Question>`;
          promptText += `\n<Answer>\n${answer.description}\n</Answer>`;
        }
      });
    });

    try {
      setAnalysisResult(`Analyzing responses with ${getAnalysisTypeName(selectedAnalysisType)} framework...`);
      console.log(promptText);
      let systemContent = "";

      switch (selectedAnalysisType) {
        case "swot":
          systemContent = `You are a strategic analyst. You should read the \"Strategic Planning Book\" given by the user and analyze the set of question answers and provide detailed SWOT analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items`;
          break;
        case "pestle":
          systemContent = `You are a strategic analyst. You should read the \"Strategic Planning Book\" given by the user and analyze the set of question answers and provide detailed PESTLE analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items.\nBe as detailed as possible`; break;
        case "noise":
          systemContent = `You are a strategic analyst. You should read the \"Strategic Planning Book\" given by the user and analyze the set of question answers and provide detailed NOISE analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items\nBe as detailed as possible`; break;
        case "vrio":
          systemContent = `You are a strategic analyst. You should read the \"Strategic Planning Book\" given by the user and analyze the set of question answers and provide detailed VRIO analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items\nBe as detailed as possible`; break;
        case "bsc":
          systemContent = `You are a strategic analyst. You should read the \"Strategic Planning Book\" given by the user and analyze the set of question answers and provide detailed Balanced Scorecard analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items\nBe as detailed as possible`; break;
        default:
          systemContent = "You are a strategic analyst. You should read the \"Strategic Planning Book\" given by the user and analyze the set of question answers and provide detailed SWOT analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items\nBe as detailed as possible";
      }

      const messages = [
        {
          "role": "system",
          "content": systemContent
        },
        {
          "role": "user",
          "content": strategicPlanningBook + promptText
        }
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
        setAnalysisResult(prevResult => prevResult + content);
      }

    } catch (error) {
      console.error(`Error generating ${selectedAnalysisType} analysis:`, error);
      setAnalysisResult(`Error generating analysis: ${error.message}`);
    }
  };

  const getAnalysisTypeName = (type) => {
    const analysisName = analysisTypes.find(a => a.id === type)?.name || "comprehensive";
    return analysisName;
  };

  const isCategoryCompleted = (category) => {
    return category.questions.every((question) => isQuestionCompleted(question.id));
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      return {};
    }
    return {
      'Authorization': `Bearer ${token}`,  // Add 'Bearer' if your backend expects it
      'Content-Type': 'application/json'
    };
  };


  const handleSaveAnswersSelection = async () => {
    try {
      // Transform the answers object into the format expected by the backend
      const answersToSave = {};

      Object.keys(answers).forEach((questionId) => {
        // Find the category for this question
        let categoryId = "";
        for (const category of categories) {
          const foundQuestion = category.questions.find(q => q.id === questionId);
          if (foundQuestion) {
            categoryId = category.id;
            break;
          }
        }

        answersToSave[questionId] = {
          selectedOption: answers[questionId].selectedOption || "",
          description: answers[questionId].description || "",
          category_id: categoryId
        };
      });

      const response = await axios.post(`${API_BASE_URL}/api/survey/answers`,
        answersToSave,
        {
          headers: {
            'Authorization': localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        }
      );

      alert("Survey answers saved successfully!");
      return response.data;
    } catch (error) {
      console.error("Error saving answers:", error);
      alert("Failed to save answers: " + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleShowAnalysisSelection = () => {
    setShowAnalysisSelection(true);
  };



  // Placeholder content for other sections with trendy design
  const renderPlaceholderContent = (section) => {
    const sectionInfo = {
      reports: {
        icon: <FileText size={48} className="mb-3 text-primary" />,
        description:
          "View and download all your survey reports in one place. Generate custom reports and share with your team.",
      },
      analytics: {
        icon: <Activity size={48} className="mb-3 text-primary" />,
        description:
          "Deep dive into your survey data with interactive charts, trends analysis, and AI-powered insights.",
      },
      settings: {
        icon: <Settings size={48} className="mb-3 text-primary" />,
        description:
          "Customize your dashboard, manage notifications, and update your account preferences.",
      },
    };

    return (
      <div className="text-center py-5 placeholder-content">
        <div className="glass-card p-5">
          {sectionInfo[section]?.icon}
          <h4 className="mb-3">
            Welcome to {section.charAt(0).toUpperCase() + section.slice(1)}
          </h4>
          <p className="text-muted">{sectionInfo[section]?.description}</p>
          <Button variant="outline-primary" className="mt-3 btn-glow">
            <Zap size={16} className="me-2" />
            Explore {section.charAt(0).toUpperCase() + section.slice(1)}
          </Button>
        </div>
      </div>
    );
  };

  // Main content based on active section
  const renderMainContent = () => {
    switch (activeSection) {
      case "survey":
        return (
          <div className="glass-card p-4">
            <div className="progress-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="progress-title mb-0">Survey Progress</h5>
                <span className="progress-percentage">
                  {getProgressPercentage()}%
                </span>
              </div>
              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${getProgressPercentage()}%` }}
                  aria-valuenow={getProgressPercentage()}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>

            {categories.map((category) => (
              <Accordion key={category.id} className="mb-4 modern-accordion">
                <Accordion.Item eventKey={category.id}>
                  <Accordion.Header
                    className={
                      isCategoryCompleted(category) ? "category-completed" : ""
                    }
                  >
                    <div className="d-flex align-items-center justify-content-between w-100">
                      <span>{category.name}</span>
                      {isCategoryCompleted(category) && (
                        <CheckCircle
                          size={20}
                          className="ms-2 text-success"
                          style={{ marginRight: "10px" }}
                        />
                      )}
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    <Accordion className="nested-accordion">
                      {category.questions.map((question) => (
                        <Accordion.Item
                          key={question.id}
                          eventKey={question.id}
                          className={
                            isQuestionCompleted(question.id)
                              ? "question-completed"
                              : ""
                          }
                        >
                          <Accordion.Header onClick={() => handleAccordionChange(question.id)}>
                            <div className="d-flex align-items-center justify-content-between w-100">
                              <span>{question.nested?.question}</span>
                              {isQuestionCompleted(question.id) && (
                                <CheckCircle
                                  size={20}
                                  className="ms-2 text-success"
                                  style={{ marginRight: "10px" }}
                                />
                              )}
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            <span className="fw-bold">{question.question}</span>

                            <div className="question-container">
                              {question.type === "options" ? (
                                <div className="flex-container">
                                  <div className="options-wrapper">
                                    <QuestionOptions
                                      question={question}
                                      value={
                                        answers[question.id]?.selectedOption ||
                                        ""
                                      }
                                      onChange={(option) =>
                                        handleOptionChange(question.id, option)
                                      }
                                    />
                                  </div>
                                  <FormattedContentViewer
                                    value={answers[question.id]?.description || ''}
                                    onChange={(newContent) => handleDescriptionChange(question.id, newContent)}
                                  />
                                </div>
                              ) : (
                                <>
                                  <FormattedContentViewer
                                    value={answers[question.id]?.description || ''}
                                    onChange={(newContent) => handleDescriptionChange(question.id, newContent)}
                                  />
                                </>
                              )}
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            ))}

            <div className="d-flex justify-content-center gap-3 mt-4">
              {/* <Button
                variant="success"
                onClick={() => handleSaveAllAnswers(true)}
                className="btn-analyze"
              >
                Save All Answers
              </Button> */}
              <Button
                variant="outline-info"
                onClick={() => setShowPreview(true)}
                className="btn-preview glass-button"
              >
                <Eye size={18} className="me-2" />
                Preview
              </Button>
              <Button
                variant="outline-primary"
                onClick={handleShowAnalysisSelection}
                className="btn-analyze"
                disabled={!allQuestionsAnswered()} // Disable if not all questions are answered
              >
                <BarChart size={18} className="me-2" />
                Analyze
              </Button>
            </div>
          </div>
        );
      default:
        return renderPlaceholderContent("survey");
    }
  };
  const QuestionOptions = ({ question, value, onChange }) => {
    if (question.type !== "options") return null;
    return (
      <div className="mb-3">
        {question.options.map((option, idx) => (
          <div key={idx} className="form-check">
            <input
              type="radio"
              id={`${question.id}-${idx}`}
              name={`question-${question.id}`}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="form-check-input"
            />
            <label
              htmlFor={`${question.id}-${idx}`}
              className="form-check-label"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    );
  };
  return (
    <div className="dashboard-layout">
      <Navbar expand="lg" className="p-2 sticky-top modern-navbar">
        <Container fluid>
          <Navbar.Brand href="#home" className="fw-bold logo-text order-1 order-lg-1">
            <span className="text-gradient">Traxxia</span>
          </Navbar.Brand>

          <div className="d-flex align-items-center order-3 order-lg-2" style={{ marginTop: "10px" }}>
            <h5>SURVEY</h5>
          </div>

          <div className="d-flex align-items-center order-2 order-lg-3" style={{ marginTop: "10px" }}>
            <Dropdown>
              <Dropdown.Toggle
                variant="link"
                id="dropdown-user"
                className="nav-profile-toggle"
              >
                <div className="avatar-circle">
                  <CircleUserRound size={25} style={{ marginRight: "5px", marginBottom: "3px" }} />
                  {username.toUpperCase()}
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" className="modern-dropdown">
                <Dropdown.Item
                  onClick={handleLogout}
                  className="dropdown-item-modern text-danger"
                >
                  <LogOut size={16} className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Navbar.Toggle aria-controls="basic-navbar-nav" className="ms-2" />
          </div>
        </Container>

      </Navbar>
      <Container fluid className="mt-4 mb-5 px-4 main-content">
        <Row>
          <Col>{renderMainContent()}</Col>
        </Row>
      </Container>
      <Modal
        show={showAnalysisSelection}
        onHide={() => setShowAnalysisSelection(false)}
        centered
        className="modern-modal"
        size="lg"
      >
        <AnalysisContent
          loading={loading}
          selectedAnalysisType={selectedAnalysisType}
          analysisTypes={analysisTypes}
          analysisResult={analysisResult}
          onAnalysisTypeSelect={setSelectedAnalysisType}
          onAnalyzeResponses={handleAnalyzeResponses}
          onResetAnalysisResult={handleResetAnalysisResult}
          onClose={() => setShowAnalysisSelection(false)}
        />

      </Modal>
      {/* Modals */}
      <Modal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        centered
        className="modern-modal"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">
            Response Summary
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PreviewContent categories={categories} answers={answers} showModal={showPreview} onHide={showPreview} />
        </Modal.Body>
      </Modal>
      <Modal
        show={showAnalysis}
        onHide={() => setShowAnalysis(false)}
        centered
        size="lg"
        dialogClassName="analysis-modal modern-modal"
      >
        <AnalysisContent
          loading={loading}
          selectedAnalysisType={selectedAnalysisType}
          analysisTypes={analysisTypes}
          analysisResult={analysisResult}
          onAnalysisTypeSelect={setSelectedAnalysisType}
          onAnalyzeResponses={handleAnalyzeResponses}
          onResetAnalysisResult={handleResetAnalysisResult}
          onClose={() => setShowAnalysis(false)}
        />
      </Modal>

      <ToastContainer
        position="bottom-center"
        className="p-3 position-fixed bottom-50 start-50 translate-middle-x z-index-1050" // This ensures it's fixed and centered
      >
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Dashboard;