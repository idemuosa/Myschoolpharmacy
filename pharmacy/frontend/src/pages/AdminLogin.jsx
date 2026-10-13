import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import api from '../services/api';
import './AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shopName, setShopName] = useState('PharmaCare Connect');

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await api.get('settings/');
        if (res.data && res.data.length > 0 && res.data[0].shop_name) {
          setShopName(res.data[0].shop_name);
        }
      } catch {
        console.error("Branding load failed");
      }
    };
    fetchBranding();
  }, []);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(username, password);
    setIsLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="pharmacist-portal-container">
      {/* Top Banner Heading */}
      <h1 className="portal-main-heading">Pharmacist Login Portal</h1>

      {/* Main Login Card */}
      <div className="pharmacist-card-wrapper">
        <div className="pharmacist-card-header-bar"></div>
        <div className="pharmacist-card-content">

          {/* Logo Branding Header */}
          <div className="pharmacist-logo-container">
            <div className="mortar-logo-icon">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
                {/* Mortar Bowl */}
                <path d="M12 28 C12 28, 14 48, 32 48 C50 48, 52 28, 52 28 Z" fill="#1e40af" />
                <path d="M10 26 H54 V29 H10 Z" fill="#1e3a8a" />
                <path d="M26 48 L22 56 H42 L38 48 Z" fill="#1e3a8a" />
                {/* Pestle */}
                <path d="M38 12 L48 24 L42 28 L32 16 Z" fill="#2563eb" rx="2" />
                {/* White Cross */}
                <path d="M29 33 H35 V39 H29 Z" fill="white" />
                <path d="M30 31 H34 V41 H30 Z" fill="white" />
              </svg>
            </div>
            <div className="brand-text-block">
              <span className="brand-title-primary">{shopName.split(' ')[0] || 'PharmaCare'}</span>
              <span className="brand-title-secondary">{shopName.split(' ').slice(1).join(' ') || 'Connect'}</span>
            </div>
          </div>

          <div className="login-title-section">
            <h2 className="login-card-title">Pharmacist Login</h2>
            <p className="login-card-subtitle">Access Your Secure Pharmacy Dashboard</p>
          </div>

          {/* Form */}
          <form className="pharmacist-login-form" onSubmit={handleSubmit}>
            <div className="form-field-group">
              <label className="field-label">Username / Pharmacist ID</label>
              <div className="input-with-icon">
                <FaUser className="field-icon-left" />
                <input
                  type="text"
                  placeholder="e.g., P12345"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="portal-input"
                  required
                />
              </div>
            </div>

            <div className="form-field-group">
              <label className="field-label">Password</label>
              <div className="input-with-icon">
                <FaLock className="field-icon-left" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="portal-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                  tabIndex="-1"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-meta-row">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkbox-label">Remember Me</span>
              </label>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          {/* Card Footer */}
          <div className="card-footer-info">
            <p className="account-help-text">
              Don't have an account? <Link to="/staff/new" className="contact-admin-link">Contact Administrator</Link>
            </p>
            <p className="copyright-text">
              © {new Date().getFullYear()} {shopName}. All Rights Reserved.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
