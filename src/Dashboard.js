import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import './Dashboard.css';
 
const questions = [
  "1. Do you have aggressive goals for growth, profitability and return on investment for the next three to five years?",
  "2. Does the strategy provide leverage for the organization’s sources of competitive advantage?",
  "3. Are new opportunities identified continuously in customers and spaces abandoned by the competition to leverage distinctive capacities?",
  "4. Is the strategy sufficiently detailed, especially regarding the battlefields? ",
  "5. Have you considered strategic planning for at least every two years?",
  "6. Is there a forum open throughout the year to debate the strategic plan?",
  "7. Does the strategy have clear action points and allocation of resources?",
  "8. In conclusion, will the strategy allow you to beat the market?"
];

const Dashboard = () => {
  const [message, setMessage] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(
    questions.map(() => ({ rating: 0, description: '' }))
  );
  const [showPreview, setShowPreview] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Unauthorized access. Please log in.');
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/dashboard', {
          headers: { Authorization: token },
        });
        setMessage(res.data.message);
      } catch (err) {
        alert(err.response?.data?.message || 'Error fetching data');
        navigate('/login');
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleRatingClick = (rating) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = {
        ...newAnswers[currentQuestion],
        rating
      };
      return newAnswers;
    });
  };

  const handleDescriptionChange = (e) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = {
        ...newAnswers[currentQuestion],
        description: e.target.value
      };
      return newAnswers;
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(curr => curr + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(curr => curr - 1);
    }
  };

  const allQuestionsAnswered = () => {
    return answers.every(answer => answer.rating > 0); 
  };

  const PreviewContent = () => {
    const answeredQuestions = answers.map((answer, index) => ({
      question: questions[index],
      ...answer
    }));

    const unansweredQuestions = answeredQuestions.filter(q => q.rating === 0);
    const answeredQuestionsFiltered = answeredQuestions.filter(q => q.rating > 0);

    return (
      <div className="preview-content">
        <div className="answered-questions">
          <h4 className="font-bold">Answered Questions</h4>
          {answeredQuestionsFiltered.map((item, index) => (
            <Card key={index} className="p-4 mb-3 shadow-sm">
              <p className="font-medium">{item.question}</p>
              <div className="flex mt-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    fill={star <= item.rating ? "gold" : "none"}
                    color={star <= item.rating ? "gold" : "gray"}
                  />
                ))}
              </div>
              {item.description && (
                <p className="mt-2 text-gray-600">{item.description}</p>
              )}
            </Card>
          ))}
        </div>

        {unansweredQuestions.length > 0 && (
          <div className="unanswered-questions mt-4">
            <h4 className="font-bold">Unanswered Questions</h4>
            {unansweredQuestions.map((item, index) => (
              <Card key={index} className="p-4 mb-3 shadow-sm">
                <p className="text-gray-600">{item.question}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleAnalyzeClick = () => {
    setShowAnalysis(true);
  };

  const AnalysisContent = () => {
    const analyzedData = answers.map((answer, index) => ({
      question: questions[index],
      rating: answer.rating,
      description: answer.description
    }));

    return (
      <div className="analysis-content">
        <div className="p-3">
          <p><strong>Strategy Formulation Is Analysing</strong>  </p>

        </div>
      </div>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="  header-container">
        <h4 className="dashboard-title">Strategy Formulation Survey</h4>
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Card className="question-card">
        <Card.Body>
          <p className="question-counter">Question {currentQuestion + 1} of {questions.length}</p>
          <p className="question-text">{questions[currentQuestion]}</p>

          <div className="stars-container">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Star
                key={rating}
                size={32}
                className="cursor-pointer hover:scale-110 transition-transform"
                fill={rating <= answers[currentQuestion].rating ? "gold" : "none"}
                color={rating <= answers[currentQuestion].rating ? "gold" : "gray"}
                onClick={() => handleRatingClick(rating)}
              />
            ))}
          </div>

          <Form.Control
            className="comment-textarea"
            as="textarea"
            placeholder="Add your comments here..."
            value={answers[currentQuestion].description}
            onChange={handleDescriptionChange}
          />

          <div className="nav-buttons">
            <Button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              variant="outline"
            >
              <ChevronLeft className="mr-2" /> Previous
            </Button>
            <Button
              onClick={nextQuestion}
              disabled={currentQuestion === questions.length - 1}
            >
              Next <ChevronRight className="ml-2" />
            </Button>
          </div>
        </Card.Body>
      </Card>

      <div className="action-buttons">
        <Button variant="outline" onClick={() => setShowPreview(true)}>
          Preview Responses
        </Button>

        <Button
          onClick={handleAnalyzeClick}
          disabled={!allQuestionsAnswered()}  // Disable if any question is unanswered
        >
          Analyze Responses
        </Button>
      </div>


      <Modal className="preview-modal" show={showPreview} onHide={() => setShowPreview(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Response Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PreviewContent />
        </Modal.Body>
      </Modal>

      <Modal className="analysis-modal" show={showAnalysis} onHide={() => setShowAnalysis(false)}>
        {/* <Modal.Header closeButton>
           
        </Modal.Header> */}
        <Modal.Body>
          <AnalysisContent />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAnalysis(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
