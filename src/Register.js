import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, FormGroup, Label, Input, FormFeedback } from 'reactstrap';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    gender: '',
    terms: false,
    email: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/register', form);
      alert(res.data.message);
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="name">Name</Label>
          <Input
            type="text"
            name="name"
            id="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label for="description">Description</Label>
          <Input
            type="textarea"
            name="description"
            id="description"
            placeholder="Enter a description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Gender</Label>
          <div>
            <FormGroup check inline>
              <Label check>
                <Input
                  type="radio"
                  name="gender"
                  value="Male"
                  onChange={handleChange}
                  required
                />{' '}
                Male
              </Label>
            </FormGroup>
            <FormGroup check inline>
              <Label check>
                <Input
                  type="radio"
                  name="gender"
                  value="Female"
                  onChange={handleChange}
                  required
                />{' '}
                Female
              </Label>
            </FormGroup>
          </div>
        </FormGroup>

        <FormGroup check>
          <Label check>
            <Input
              type="checkbox"
              name="terms"
              onChange={handleChange}
              required
            />{' '}
            I agree to the terms and conditions
          </Label>
        </FormGroup>

        <FormGroup>
          <Label for="email">Email</Label>
          <Input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            invalid={!!errors.email}
            required
          />
          <FormFeedback>{errors.email}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for="password">Password</Label>
          <Input type="password" name="password" id="password" value={form.password} onChange={handleChange} required />
        </FormGroup>

        <Button color="primary" type="submit">
          Register
        </Button>
      </Form>
    </div>
  );
};

export default Register;
