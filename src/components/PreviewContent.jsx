import { useState, useEffect } from "react";
import { Modal, Button, Card, Collapse } from "react-bootstrap"; // Import necessary components
import { ChevronDown, ChevronUp } from "react-bootstrap-icons"; // Import arrow icons

const PreviewContent = ({ showModal, onHide , categories, answers }) => {
   const [openCards, setOpenCards] = useState({});
  
    // On initial render, set all cards to be open
    useEffect(() => {
      const initialOpenState = categories.reduce((acc, category) => {
        category.questions.forEach((question) => {
          acc[question.id] = true; // Set each card's state to 'open' (true)
        });
        return acc;
      }, {});
      
      setOpenCards(initialOpenState); // Set all cards as open
    }, [categories]);
  
     const handleToggle = (event, cardId) => {
      event.preventDefault(); // Prevent the page from scrolling
      setOpenCards(prevState => ({
        ...prevState,
        [cardId]: !prevState[cardId] // Toggle the current card's open state
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
                    onClick={(e) => handleToggle(e, question.id)} // Prevent scroll and toggle the card
                  >
                    {openCards[question.id] ? (
                      <ChevronUp size={20} /> // Up arrow for expanded state
                    ) : (
                      <ChevronDown size={20} /> // Down arrow for collapsed state
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
                        {
                          answers[question.id]?.description
                            .replace(/<br\s*\/?>/gi, "\n") 
                            .replace(/&lt;br\/&gt;/gi, "\n") 
                            .replace(/\\n/g, "\n") 
                            .replace(/<\/?[^>]+(>|$)/g, "") 
                        }
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