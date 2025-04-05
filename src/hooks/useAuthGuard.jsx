import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const useAuthGuard = () => {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/dashboard`, {
          headers: { Authorization: token },
        });
        
        if (response.data && response.data.user) {
          setUsername(response.data.user.name || "User");
          setIsLoggedIn(true);
        } else {
          throw new Error("Invalid user data");
        }
      } catch (err) {
        console.error("Authentication failed:", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  return {
    username,
    isLoggedIn
  };
};

export default useAuthGuard;