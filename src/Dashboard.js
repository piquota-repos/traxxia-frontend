import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Modal, Form, ProgressBar, Container, Row, Col } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, Star, LogOut, Eye, BarChart } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const navigate = useNavigate();

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
        const res = await axios.get('http://localhost:5000/dashboard', {
          headers: { Authorization: token },
        });
        setMessage(res.data.message);
      } catch (err) {
        alert(err.response?.data?.message || 'Error fetching data');
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

  const handleRatingClick = (rating) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = { ...newAnswers[currentQuestion], rating };
      return newAnswers;
    });
  };

  const handleDescriptionChange = (e) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = { ...newAnswers[currentQuestion], description: e.target.value };
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

  const allQuestionsAnswered = () => answers.every(answer => answer.rating > 0);

  const PreviewContent = () => (
    <div className="preview-content">
      <h4 className="font-bold text-center mb-4">Your Responses</h4>
      {answers.map((item, index) => (
        <Card key={index} className="p-3 mb-3 shadow rounded">
          <h5>{questions[index]}</h5>
          <div className="d-flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} size={20} fill={star <= item.rating ? "#FFD700" : "none"} color={star <= item.rating ? "#FFD700" : "#ccc"} />
            ))}
          </div>
          {item.description && <p className="text-muted mt-2">{item.description}</p>}
        </Card>
      ))}
    </div>
  );

  const AnalysisContent = () => (
    <div className="analysis-content text-center p-4">
      <h5 className="mb-3">Analyzing Your Responses...</h5>
      <ProgressBar animated now={75} variant="info" />
    </div>
  );

  return (
    <Container className="dashboard-container py-4">
      <Row className="align-items-center mb-4">
        <Col><h3 className="fw-bold text-primary">Strategy Formulation Survey</h3></Col>
        <Col className="text-end">
          <Button variant="outline-danger" onClick={handleLogout}><LogOut size={18} className="me-2" />Logout</Button>
        </Col>
      </Row>

      {questions.length > 0 && (
        <Card className="p-4 shadow-sm rounded">
          <p className="text-muted">Question {currentQuestion + 1} of {questions.length}</p>
          <h5 className="fw-semibold mb-3">{questions[currentQuestion]}</h5>

          <div className="d-flex gap-2 mb-3 justify-content-start">
            {[1, 2, 3, 4, 5].map(rating => (
              <Star key={rating} size={32} fill={rating <= answers[currentQuestion].rating ? "#FFD700" : "none"} color={rating <= answers[currentQuestion].rating ? "#FFD700" : "#ccc"} onClick={() => handleRatingClick(rating)} className="star-hover" />
            ))}
          </div>

          <Form.Control as="textarea" rows={3} placeholder="Add comments..." value={answers[currentQuestion].description} onChange={handleDescriptionChange} className="mb-3" />

          <div className="d-flex justify-content-between">
            <Button variant="secondary" onClick={prevQuestion} disabled={currentQuestion === 0}><ChevronLeft size={20} /> Previous</Button>
            <Button variant="primary" onClick={nextQuestion} disabled={currentQuestion === questions.length - 1}>Next <ChevronRight size={20} /></Button>
          </div>
        </Card>
      )}

      <div className="d-flex justify-content-center gap-3 mt-4">
        <Button variant="outline-info" onClick={() => setShowPreview(true)}><Eye size={18} className="me-2" />Preview</Button>
        <Button variant="success" onClick={() => setShowAnalysis(true)} disabled={!allQuestionsAnswered()}><BarChart size={18} className="me-2" />Analyze</Button>
      </div>

      <Modal show={showPreview} onHide={() => setShowPreview(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">Response Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body><PreviewContent /></Modal.Body>
      </Modal>

      <Modal show={showAnalysis} onHide={() => setShowAnalysis(false)} centered>
        <Modal.Body><AnalysisContent /></Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAnalysis(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard;
