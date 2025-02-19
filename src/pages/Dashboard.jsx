import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Modal, Form, Container, Row, Col, Accordion, Alert } from 'react-bootstrap';
import { Star, LogOut, Eye, BarChart, CheckCircle } from 'lucide-react';
import useGroqChat from '../components/GroqChat';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const navigate = useNavigate();
  const { generateResponse, loading, error } = useGroqChat();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/questions.json');
        const data = await res.json();
        setQuestions(data);
        setAnswers(data.map(() => ({ rating: 0, description: '' })));
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Unauthorized access. Please log in.');
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/dashboard', {
          headers: { Authorization: token },
        });
        if (!response.ok) throw new Error('Failed to fetch data');
      } catch (err) {
        alert('Error fetching data');
        navigate('/login');
      }
    };

    fetchQuestions();
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleRatingClick = (index, rating) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      const newRating = prev[index].rating === rating ? 0 : rating;
      newAnswers[index] = { ...newAnswers[index], rating: newRating };
      return newAnswers;
    });
  };

  const handleDescriptionChange = (index, e) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[index] = { ...newAnswers[index], description: e.target.value };
      return newAnswers;
    });
  };

  const isQuestionCompleted = (index) => {
    return answers[index]?.rating > 0 && answers[index]?.description.trim() !== '';
  };

  const allQuestionsAnswered = () => answers.every(answer =>
    answer.rating > 0 && answer.description.trim() !== ''
  );

  const getAccordionStyles = (index) => {
    return {
      backgroundColor: isQuestionCompleted(index) ? '#e8f5e9' : 'white',
      borderLeft: isQuestionCompleted(index) ? '4px solid #4caf50' : 'none',
      transition: 'all 0.3s ease'
    };
  };

  const handleAnalyzeResponses = async () => {
    const prompt = `Please analyze the following survey responses and provide insights:
      ${questions.map((q, i) => {
      return `Question ${i + 1}: ${q} Rating: ${answers[i].rating}/5 Comments: ${answers[i].description}
        How easy is it to get the data for this question: ${q['How easy is it to get it? (using ChatGPT)']}`;
    }).join('\n')}
      Please provide a structured analysis based on the following key:
      ${questions.map((q, i) => {
      return `For Question ${i + 1}, the key is: ${q['How easy is it to get it? (using ChatGPT)']}`;
    }).join('\n')}`;

    const analysis = await generateResponse(prompt);
    if (analysis) {
      setAnalysisResult(analysis);
      setShowAnalysis(true);
    }
  };

  const StarRating = ({ currentRating, onRatingChange }) => {
    return (
      <div className="d-flex gap-2 mb-3">
        {[1, 2, 3, 4, 5].map(rating => (
          <Star
            key={rating}
            size={32}
            fill={rating <= currentRating ? "#FFD700" : "none"}
            color={rating <= currentRating ? "#FFD700" : "#ccc"}
            onClick={() => onRatingChange(rating)}
            style={{ cursor: 'pointer' }}
            className="star-hover"
          />
        ))}
      </div>
    );
  };

  const PreviewContent = () => (
    <div className="preview-content">
      <h4 className="text-center mb-4 fw-bold">Your Responses</h4>
      {questions.map((item, index) => (
        <Card key={index} className="mb-3">
          <Card.Body>
            <h5>{item.Question}</h5>
            <div className="d-flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={20}
                  fill={star <= answers[index].rating ? "#FFD700" : "none"}
                  color={star <= answers[index].rating ? "#FFD700" : "#ccc"}
                />
              ))}
            </div>
            {answers[index]?.description && <p className="text-muted">{answers[index].description}</p>}
          </Card.Body>
        </Card>
      ))}
    </div>
  );

  const AnalysisContent = () => (
    <div className="p-4">
      {loading ? (
        <div className="text-center">
          <h5 className="mb-3">Analyzing Your Responses...</h5>
          <div className="progress">
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              style={{ width: '75%' }}
            ></div>
          </div>
        </div>
      ) : (
        <div>
          <h5 className="mb-3">Analysis Results</h5>
          <div className="analysis-content" style={{ whiteSpace: 'pre-line' }}>
            {analysisResult}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Container className="py-4 dashboard-container">
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="fw-bold text-primary">Strategy Formulation Survey</h3>
        </Col>
        <Col className="text-end">
          <Button variant="outline-danger" onClick={handleLogout}>
            <LogOut size={18} className="me-2" />Logout
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          Error: {error}
        </Alert>
      )}

      <Accordion className="mb-4">
        {questions.map((question, index) => (
          <Accordion.Item
            key={index}
            eventKey={index.toString()}
            style={getAccordionStyles(index)}
          >
            <Accordion.Header>
              <div className="d-flex align-items-center justify-content-between w-100">
                <span>Question {index + 1}: {question.Question}</span> {/* Update this line */}
                {isQuestionCompleted(index) && (
                  <CheckCircle
                    size={20}
                    className="ms-2 text-success"
                    style={{ marginRight: '10px' }}
                  />
                )}
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <div className="mb-3">
                <StarRating
                  currentRating={answers[index].rating}
                  onRatingChange={(rating) => handleRatingClick(index, rating)}
                />
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Add comments..."
                  value={answers[index].description}
                  onChange={(e) => handleDescriptionChange(index, e)}
                />
              </div>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>


      <div className="d-flex justify-content-center gap-3">
        <Button variant="outline-info" onClick={() => setShowPreview(true)}>
          <Eye size={18} className="me-2" />Preview
        </Button>
        <Button
          variant="success"
          onClick={handleAnalyzeResponses}
          disabled={loading || !allQuestionsAnswered()}
        >
          <BarChart size={18} className="me-2" />
          {loading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>

      <Modal show={showPreview} onHide={() => setShowPreview(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">Response Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PreviewContent />
        </Modal.Body>
      </Modal>

      <Modal
        show={showAnalysis}
        onHide={() => setShowAnalysis(false)}
        centered
        size="lg"
        dialogClassName="analysis-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Detailed Analysis</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AnalysisContent />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAnalysis(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard;
