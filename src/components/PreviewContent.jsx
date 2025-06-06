import React from 'react';
import { Badge, Card, Row, Col } from 'react-bootstrap';

const PreviewContent = ({ categories=[], answers={} }) => {
  // Helper function to get answer text
  const getAnswerText = (questionId) => {
     for (const category of categories) {
            const question = category.questions.find(q => (q.question_id || q.id) === questionId);
            if (question && question.answer) { 
                return question.answer;
            }
          }
    
    // Retrieve the answer object for the questionId
    const answer = answers[questionId] || {};
    // Check for different answer types
    if (answer.selectedOption) return answer.selectedOption;
    if (answer.selectedOptions && answer.selectedOptions.length > 0) {
      return answer.selectedOptions.join(', ');
    }
    if (answer.rating) return `Rating: ${answer.rating}`;
    if (answer.answer) return answer.answer;
    if (answer.description) return answer.description;
    
    return '';
  };

  // Helper function to check if question is answered
  const isQuestionAnswered = (questionId) => {
    const answerText = getAnswerText(questionId);
    return answerText.trim().length > 0;
  };

  // Get total statistics
  const getTotalStats = () => {
    const allQuestions = categories.flatMap(category => 
      category.questions.map(question => ({
        ...question,
        categoryName: category.category_name || category.name
      }))
    );
    
    const totalQuestions = allQuestions.length;
    const answeredQuestions = allQuestions.filter(q => 
      isQuestionAnswered(q.question_id || q.id)
    ).length;
    
    return { totalQuestions, answeredQuestions, allQuestions };
  };

  const { totalQuestions, answeredQuestions } = getTotalStats();
  const completionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  return (
    <div className="preview-content">
      {/* Overall Statistics */}
      <Card className="border-info">
        <Card.Header className="bg-info text-white">
          <h6 className="mb-0">📋 Summary</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <ul className="list-unstyled">
                <li><strong>Total Questions:</strong> {totalQuestions}</li>
                <li><strong>Answered Questions:</strong> {answeredQuestions}</li>
                <li><strong>Pending Questions:</strong> {totalQuestions - answeredQuestions}</li>
              </ul>
            </Col>
            <Col md={6}>
              <ul className="list-unstyled">
                <li><strong>Completion Rate:</strong> {completionPercentage}%</li>
                <li><strong>Categories:</strong> {categories.length}</li>
                <li><strong>Status:</strong> 
                  <Badge bg={completionPercentage === 100 ? "success" : "warning"} className="ms-2">
                    {completionPercentage === 100 ? "Complete" : "In Progress"}
                  </Badge>
                </li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Questions by Category */}
      {categories.map((category) => {
        const categoryQuestions = category.questions || [];
        const categoryAnswered = categoryQuestions.filter(q => 
          isQuestionAnswered(q.question_id || q.id)
        ).length;
        const categoryTotal = categoryQuestions.length;
        const categoryCompletion = categoryTotal > 0 ? Math.round((categoryAnswered / categoryTotal) * 100) : 0;
        console.log("🚀 Categories Received:", categories);
        console.log("🚀 Answers Received:", answers);
        return (
          <Card key={category.category_id || category.id} className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                📁 {category.category_name || category.name}
              </h6>
              <div className="d-flex align-items-center gap-2">
                <Badge bg={categoryCompletion === 100 ? "success" : categoryCompletion > 0 ? "warning" : "secondary"}>
                  {categoryAnswered}/{categoryTotal}
                </Badge>
                <Badge bg={categoryCompletion === 100 ? "success" : "light"} text="dark">
                  {categoryCompletion}%
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              {categoryQuestions.length === 0 ? (
                <p className="text-muted text-center">No questions in this category</p>
              ) : (
                categoryQuestions.map((question, index) => {
                  const questionId = question.question_id || question.id;
                  const answerText = getAnswerText(questionId);
                  const isAnswered = isQuestionAnswered(questionId);

                  return (
                    <div 
                      key={questionId} 
                      className={`question-preview mb-3 p-3 border rounded ${
                        isAnswered ? 'border-success bg-light' : 'border-warning bg-light'
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="question-text mb-0">
                          <Badge bg="secondary" className="me-2">
                            Q{index + 1}
                          </Badge>
                          {question.question_text || question.question}
                        </h6>
                        <Badge bg={isAnswered ? "success" : "warning"}>
                          {isAnswered ? "✅ Answered" : "⏳ Pending"}
                        </Badge>
                      </div>
                      
                      {/* Question Type Badge */}
                      <div className="mb-2">
                        <Badge bg="info" className="me-2">
                          {question.question_type || question.type || 'text'}
                        </Badge>
                        {question.options && question.options.length > 0 && (
                          <Badge bg="secondary">
                            {question.options.length} options
                          </Badge>
                        )}
                      </div>

                      {/* Answer Display */}
                      <div className="answer-section">
                        <strong>Answer:</strong>
                        <div className={`mt-1 p-2 rounded`}>
                          {isAnswered ? (
                            <div 
                              className="answer-text"
                              dangerouslySetInnerHTML={{ 
                                __html: answerText.replace(/\n/g, '<br>') 
                              }}
                            />
                          ) : (
                            <span className="text-muted fst-italic">
                              No answer provided yet
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Show options for multiple choice questions */}
                      {question.options && question.options.length > 0 && (
                        <div className="mt-2">
                          <small className="text-muted">Available options:</small>
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {question.options.map((option, optIndex) => (
                              <Badge 
                                key={optIndex} 
                                bg={answerText.includes(option) ? "primary" : "light"} 
                                text={answerText.includes(option) ? "white" : "dark"}
                                className="small"
                              >
                                {option}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Nested questions if applicable */}
                      {/* {question.nested && isAnswered && (
                        <div className="mt-3 p-2 border-start border-primary border-3 bg-info bg-opacity-10">
                          <small className="text-muted">Follow-up question:</small>
                          <div className="fw-bold">{question.nested.question}</div>
                          <div className="mt-1">
                            {getAnswerText(question.nested.id) || (
                              <span className="text-muted fst-italic">No answer provided</span>
                            )}
                          </div>
                        </div>
                      )} */}
                    </div>
                  );
                })
              )}
            </Card.Body>
          </Card>
        );
      })}
      
    </div>
  );
};

export default PreviewContent;