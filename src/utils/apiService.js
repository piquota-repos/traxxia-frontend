import axios from 'axios';
import { getAuthData } from './auth';

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_BACKEND_URL;
    this.authData = getAuthData();
  }

 getHeaders() {
  const authData = getAuthData();
  return {
    'Authorization': `Bearer ${authData.token}`,
    'Content-Type': 'application/json'
  };
}

  async saveAnswers(businessData) {
    const answersArray = [];
    
    businessData.categories.forEach(category => {
      category.questions.forEach(question => {
        answersArray.push({
          question_id: question.id,
          answer: question.answer || '',
          selected_option: '',
          selected_options: [],
          rating: null
        });
      });
    });

    return axios.post(`${this.baseURL}/api/survey/submit`, {
      version: this.authData.latestVersion || '1.0',
      answers: answersArray
    }, {
      headers: this.getHeaders()
    });
  }
}

export const apiService = new ApiService();