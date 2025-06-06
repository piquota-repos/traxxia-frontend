import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import logo from '../assets/01a2750def81a5872ec67b2b5ec01ff5e9d69d0e.png';
import facebook from '../assets/facebook (1).png';
import social from '../assets/social.png';
import apple from '../assets/apple.png'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    // Trigger Chrome's auto-translate detection by adding Spanish content
    const triggerChromeAutoTranslate = () => {
      // Add substantial Spanish content to trigger Chrome's language detection
      const spanishContent = document.createElement('div');
      spanishContent.id = 'chrome-translate-trigger';
      spanishContent.setAttribute('translate', 'yes');
      spanishContent.lang = 'es';
      spanishContent.innerHTML = `
        <div style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;">
          <h1>Bienvenido a Traxxia - Plataforma de Análisis Empresarial</h1>
          <h2>Iniciar Sesión en su Cuenta</h2>
          <p>Esta aplicación web está completamente en idioma español para usuarios hispanohablantes.</p>
          <p>Traxxia es una plataforma integral de análisis de datos empresariales diseñada específicamente para el mercado latinoamericano.</p>
          <p>Para acceder a su cuenta, por favor ingrese su dirección de correo electrónico y contraseña en los campos correspondientes.</p>
          <p>Si aún no tiene una cuenta registrada, puede crear una nueva cuenta haciendo clic en el enlace de registro.</p>
          <p>También puede iniciar sesión utilizando sus cuentas de Google, Apple o Facebook para mayor comodidad.</p>
          <p>Nuestra plataforma ofrece análisis avanzados, reportes detallados y visualizaciones interactivas para ayudar a su empresa a tomar decisiones informadas.</p>
          <p>El sistema está optimizado para funcionar en dispositivos móviles y de escritorio, garantizando una experiencia fluida en cualquier dispositivo.</p>
          <p>Para soporte técnico o consultas comerciales, puede contactar a nuestro equipo de atención al cliente en español.</p>
          <p>Todos los datos están protegidos con encriptación de nivel empresarial y cumplimos con las regulaciones internacionales de privacidad.</p>
          <p>Dashboard personalizable con métricas clave de rendimiento empresarial en tiempo real.</p>
          <p>Integración perfecta con sistemas ERP, CRM y otras herramientas empresariales existentes.</p>
          <p>Análisis predictivo avanzado utilizando algoritmos de machine learning e inteligencia artificial.</p>
          <p>Reportes automatizados y alertas personalizadas para mantenerse al día con las tendencias del negocio.</p>
        </div>
      `;
      document.body.appendChild(spanishContent);

      // Set page language attributes to help Chrome detect
      document.documentElement.lang = 'es';
      
      // Add meta tags for better detection
      const metaLang = document.createElement('meta');
      metaLang.setAttribute('http-equiv', 'content-language');
      metaLang.setAttribute('content', 'es');
      document.head.appendChild(metaLang);

      const metaTranslate = document.createElement('meta');
      metaTranslate.name = 'google';
      metaTranslate.content = 'translate';
      document.head.appendChild(metaTranslate);

      // Force DOM mutation to trigger Chrome's detection
      setTimeout(() => {
        spanishContent.innerHTML += '<p>Contenido adicional para activar la detección automática de Chrome.</p>';
        
        // Change language back to English to trigger detection
        setTimeout(() => {
          document.documentElement.lang = 'en';
          metaLang.setAttribute('content', 'en');
        }, 1000);
      }, 500);

      console.log('✅ Spanish content added to trigger Chrome auto-translate detection');
    };

    // Trigger Chrome translate detection after component mounts
    const timer = setTimeout(triggerChromeAutoTranslate, 2000);

    // Add more content periodically to increase detection chances
    const interval = setInterval(() => {
      const triggerContent = document.getElementById('chrome-translate-trigger');
      if (triggerContent && !document.body.classList.contains('translated-ltr')) {
        // Add dynamic content to keep triggering detection
        const dynamicContent = document.createElement('p');
        dynamicContent.style.cssText = 'position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;';
        dynamicContent.textContent = `Análisis empresarial en tiempo real - ${new Date().toISOString()}`;
        dynamicContent.lang = 'es';
        triggerContent.appendChild(dynamicContent);
      }
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await axios.post(`${API_BASE_URL}/api/login`, {
        email,
        password,
      });
      
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('userId', res.data.user.id);
      sessionStorage.setItem('userName', res.data.user.name);
      sessionStorage.setItem('userEmail', res.data.user.email);
      sessionStorage.setItem('userRole', res.data.user.role);
      sessionStorage.setItem('latestVersion', res.data.latest_version || '');
      sessionStorage.setItem('isAdmin', res.data.user.role === 'admin' ? 'true' : 'false');
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-left-section">
        <div className="company-branding">
          <div className="logo-container">
           <img src={logo} alt="Traxxia Logo" className="logo" />
          </div>
          <div className="decoration-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
      </div>
      
      <div className="login-right-section">
        <div className="login-box">
          <h2>Welcome!</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-container">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <button 
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEye : faEyeSlash }
                    className="eye-icon"
                    style={{ color: '#8F9098', fontSize: '20px' }} 
                  />
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Log In'}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Not a member? <a href="/register">Register now</a></p>
          </div>
          <hr className='divider' />
          <p>Or continue with</p>
          <div className='social-login'>
            <a href="https://google.com" target="_blank" rel="noopener noreferrer">
              <img src={social} alt="Google" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <img src={apple} alt="Apple" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <img src={facebook} alt="Facebook" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;