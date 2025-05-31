import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Table, Button, Form, Alert, Spinner } from 'react-bootstrap';
import MenuBar from '../components/MenuBar';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [questionsJson, setQuestionsJson] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token'); // Changed from localStorage to sessionStorage
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Download CSV for a specific user
  const downloadUserCSV = async (userId, version) => {
    try {
      const token = sessionStorage.getItem('token'); // Changed from localStorage to sessionStorage
      const response = await fetch(`http://localhost:5000/api/download-csv/${userId}?version=${version}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download CSV');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_${userId}_v${version}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(`Failed to download CSV: ${err.message}`);
    }
  };

  // Upload questions
  const uploadQuestions = async () => {
    setUploadLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = sessionStorage.getItem('token'); // Changed from localStorage to sessionStorage
      const questionsData = JSON.parse(questionsJson);

      const response = await fetch('http://localhost:5000/api/admin/upload-questions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(questionsData)
      });

      if (!response.ok) {
        throw new Error('Failed to upload questions');
      }

      const result = await response.json();
      setSuccess(`Questions uploaded successfully! Version: ${result.version}, Categories: ${result.totalCategories}, Questions: ${result.totalQuestions}`);
      setQuestionsJson('');
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your JSON syntax.');
      } else {
        setError(err.message);
      }
    } finally {
      setUploadLoading(false);
    }
  };

  // Load sample JSON
  const loadSampleJson = () => {
    const sampleJson = {
      "version": "1.0",
      "questions": [
        {
          "id": 1,
          "name": "Customer",
          "questions": [
            {
              "id": "1a",
              "nested": { "id": "a)", "question": "Target Demographics" },
              "question": "Who are your target demographics?",
              "type": "open-ended"
            }
          ]
        }
      ]
    };
    setQuestionsJson(JSON.stringify(sampleJson, null, 2));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <MenuBar />
      <Container className="mt-4">
        <Row>
          <Col>
            <h2>Admin Panel</h2>
            
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            <Tab.Container defaultActiveKey="users">
              <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                  <Nav.Link eventKey="users">Users Management</Nav.Link>
                </Nav.Item>
                {/* <Nav.Item>
                  <Nav.Link eventKey="questions">Upload Questions</Nav.Link>
                </Nav.Item> */}
              </Nav>

              <Tab.Content>
                {/* Users Management Tab */}
                <Tab.Pane eventKey="users">
                  <Card>
                    <Card.Header>
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">All Users</h5>
                        <Button variant="outline-primary" onClick={fetchUsers} disabled={loading}>
                          {loading ? <Spinner size="sm" /> : 'Refresh'}
                        </Button>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      {loading ? (
                        <div className="text-center">
                          <Spinner animation="border" />
                        </div>
                      ) : (
                        <Table responsive striped hover>
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Company</th>
                              <th>Created At</th>
                              <th>Total Responses</th>
                              <th>Latest Response</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((user) => (
                              <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.company}</td>
                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                <td>{user.total_responses}</td>
                                <td>
                                  {user.latest_response ? (
                                    <div>
                                      <small>
                                        v{user.latest_response.version}<br />
                                        {new Date(user.latest_response.submitted_at).toLocaleDateString()}
                                      </small>
                                    </div>
                                  ) : (
                                    <span className="text-muted">No responses</span>
                                  )}
                                </td>
                                <td>
                                  {user.latest_response && (
                                    <Button
                                      size="sm"
                                      variant="outline-success"
                                      onClick={() => downloadUserCSV(user.id, user.latest_response.version)}
                                    >
                                      Download CSV
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      )}

                      {!loading && users.length === 0 && (
                        <div className="text-center text-muted">
                          <p>No users found</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* Upload Questions Tab */}
                <Tab.Pane eventKey="questions">
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Upload Questions</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form>
                        <Form.Group className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <Form.Label>Questions JSON</Form.Label>
                            <Button variant="outline-secondary" size="sm" onClick={loadSampleJson}>
                              Load Sample
                            </Button>
                          </div>
                          <Form.Control
                            as="textarea"
                            rows={15}
                            value={questionsJson}
                            onChange={(e) => setQuestionsJson(e.target.value)}
                            placeholder="Paste your questions JSON here..."
                            style={{ fontFamily: 'monospace', fontSize: '14px' }}
                          />
                          <Form.Text className="text-muted">
                            Upload questions in JSON format. The JSON should include version and questions array.
                          </Form.Text>
                        </Form.Group>

                        <div className="d-grid">
                          <Button
                            variant="primary"
                            size="lg"
                            onClick={uploadQuestions}
                            disabled={!questionsJson.trim() || uploadLoading}
                          >
                            {uploadLoading ? (
                              <>
                                <Spinner size="sm" className="me-2" />
                                Uploading...
                              </>
                            ) : (
                              'Upload Questions'
                            )}
                          </Button>
                        </div>
                      </Form>

                      <hr className="my-4" />

                      <div className="bg-light p-3 rounded">
                        <h6>JSON Format Example:</h6>
                        <pre className="mb-0" style={{ fontSize: '12px' }}>
{`{
  "version": "1.0",
  "questions": [
    {
      "id": 1,
      "name": "Customer",
      "questions": [
        {
          "id": "1a",
          "nested": { "id": "a)", "question": "Target Demographics" },
          "question": "Who are your target demographics?",
          "type": "open-ended"
        }
      ]
    }
  ]
}`}
                        </pre>
                      </div>
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Admin;