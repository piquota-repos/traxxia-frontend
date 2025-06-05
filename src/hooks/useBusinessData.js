// hooks/useBusinessData.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthData } from '../utils/auth';
import { transformBusinessData, getErrorMessage } from '../utils/analysisHelpers';

export const useBusinessData = (businessName) => {
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
  const { userId, latestVersion, token } = getAuthData();

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true);
        
        const response = await axios.post(`${API_BASE_URL}/api/get-user-response`, {
          user_id: userId,
          version: latestVersion || '1.0'
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = response.data;
        const transformedData = transformBusinessData(data, businessName);
        
        setBusinessData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching business data:', err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [businessName, userId, latestVersion, token, API_BASE_URL]);

  return { businessData, setBusinessData, loading, error };
};