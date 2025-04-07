import { useState, useEffect } from "react";
import { Modal, Button, Card, Collapse } from "react-bootstrap";  
import { ChevronDown, ChevronUp } from "react-bootstrap-icons";  

const PreviewContent = ({ showModal, onHide, categories, answers }) => {
  const [openCards, setOpenCards] = useState({});  
  useEffect(() => {
    const initialOpenState = categories.reduce((acc, category) => {
      category.questions.forEach((question) => {
        acc[question.id] = true;  
      });
      return acc;
    }, {});

    setOpenCards(initialOpenState);  
  }, [categories]);

  const handleToggle = (event, cardId) => {
    event.preventDefault();  
    setOpenCards(prevState => ({
      ...prevState,
      [cardId]: !prevState[cardId]  
    }));
  };

  return (
    <div className="preview-content">
      {categories.map((category) => (
        <div key={category.id} className="mb-4">
          <h5 className="category-heading">{category.name}</h5>

          {category.questions.map((question) => (
            <Card key={question.id} className="mb-3 preview-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <p className="preview-question">{question.question}</p>
                  <button
                    className="btn btn-link p-0"
                    onClick={(e) => handleToggle(e, question.id)} 
                  >
                    {openCards[question.id] ? (
                      <ChevronUp size={20} />  
                    ) : (
                      <ChevronDown size={20} />  
                    )}
                  </button>
                </div>

                <Collapse in={openCards[question.id]}>
                  <div>
                    {question.type === "options" &&
                      answers[question.id]?.selectedOption && (
                        <div className="preview-option">
                          <p className="text-primary">Selected Option: </p>
                          <p>{answers[question.id].selectedOption}</p>
                          <br></br>
                        </div>
                      )}

                    {answers[question.id]?.description && (
                      <div
                        className="text-muted"
                        style={{
                          whiteSpace: "pre-wrap",
                          wordWrap: "break-word",
                        }}
                      >
                        <p className="text-primary">Description:</p>
                        {answers[question.id]?.description && (
                          <div
                            className="text-muted"
                            style={{
                              whiteSpace: "pre-wrap",
                              wordWrap: "break-word",
                            }}
                            dangerouslySetInnerHTML={{
                              __html: answers[question.id].description,
                            }}
                          ></div>
                        )}
                      </div>
                    )}
                  </div>
                </Collapse>
              </Card.Body>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
};
export default PreviewContent;