import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../services/store';
import { useToast } from './Toast';
import { supabase } from '../services/supabase';
import { Lock, Mail, User as UserIcon, Eye, EyeOff, X, CheckCircle, Send, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const { login, isLoading } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      // Validação para registro
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Por favor, preencha todos os campos');
        showToast('Por favor, preencha todos os campos', 'error');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem');
        showToast('As senhas não coincidem', 'error');
        return;
      }

      if (formData.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        showToast('A senha deve ter pelo menos 6 caracteres', 'error');
        return;
      }

      // TODO: Implement registration with Supabase
      showToast('Funcionalidade de registro em desenvolvimento', 'info');
    } else {
      // Validação para login
      if (!formData.email || !formData.password) {
        setError('Por favor, preencha todos os campos');
        showToast('Por favor, preencha todos os campos', 'error');
        return;
      }

      // Show loading state only during login attempt
      setIsSubmitting(true);
      
      const result = await login(formData.email, formData.password);
      
      setIsSubmitting(false);
      
      if (!result.success) {
        // Keep the inputs filled on error
        setError(result.error || 'Erro ao fazer login');
        showToast(result.error || 'Email ou senha incorretos', 'error');
        // Don't clear the form - user can correct their input
      } else {
        showToast('Login realizado com sucesso!', 'success');
        // Clear form only on success
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          name: ''
        });
        // Navigation will be handled by the App component based on user role
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true);
    setEmailSent(false);
    setForgotPasswordEmail('');
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) return;
    
    setIsSendingReset(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        // Tratamento especial para rate limit
        if (error.message.includes('can only request this after')) {
          const match = error.message.match(/after (\d+) seconds/);
          const seconds = match ? match[1] : 'alguns';
          showToast(`Por segurança, aguarde ${seconds} segundos para solicitar novamente`, 'error');
        } else {
          showToast('Erro ao enviar email de recuperação', 'error');
        }
        console.error('Reset password error:', error);
        return;
      }

      setEmailSent(true);
      showToast('Email enviado com sucesso!', 'success');
    } catch (error) {
      console.error('Error sending reset email:', error);
      showToast('Erro ao enviar email de recuperação', 'error');
    } finally {
      setIsSendingReset(false);
    }
  };

  const closeModal = () => {
    setShowForgotPasswordModal(false);
    setEmailSent(false);
    setForgotPasswordEmail('');
  };

  return (
    <>
      <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden">
        {/* Imagem centralizada */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <img
            src="/imagelogin.png"
            alt="AcessPass"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gradient-primary mb-2">
              {isRegister ? 'Criar Conta' : 'Login'}
            </h1>
            <p className="text-gray-500">
              {isRegister ? 'Preencha seus dados para se cadastrar' : 'Entre com suas credenciais'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            {/* Name Input - Only for Register */}
            {isRegister && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {isRegister ? 'Email' : 'Username'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="admin@pass.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {isRegister ? 'Senha' : 'Password'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input - Only for Register */}
            {isRegister && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  {isRegister ? 'Manter conectado' : 'Remember me'}
                </label>
              </div>
              {!isRegister && (
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="font-medium text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login/Register Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-primary hover:bg-gradient-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isSubmitting || isLoading) && <Loader2 className="w-4 h-4 animate-spin" />}
              {isRegister ? 'Criar Conta' : 'Entrar'}
            </button>

            {/* Register/Login Toggle Link */}
            <div className="text-center text-sm text-gray-600">
              {isRegister ? (
                <>
                  Já tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setError('');
                      setFormData({ email: '', password: '', confirmPassword: '', name: '' });
                    }}
                    className="font-medium text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    Fazer Login
                  </button>
                </>
              ) : (
                <>
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(true);
                      setError('');
                      setFormData({ email: '', password: '', confirmPassword: '', name: '' });
                    }}
                    className="font-medium text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    Registrar-se
                  </button>
                </>
              )}
            </div>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Wellbeing. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-in">
            {/* Modal Header */}
            <div className="relative p-6 border-b border-gray-200">
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold text-gradient-primary">
                {emailSent ? 'Email Enviado!' : 'Recuperar Senha'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {emailSent 
                  ? 'Verifique sua caixa de entrada' 
                  : 'Digite seu email para receber o link de recuperação'}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {!emailSent ? (
                <form onSubmit={handleSendResetEmail} className="space-y-4">
                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="forgot-email"
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="seu@email.com"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-primary hover:bg-gradient-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingReset ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Link de Recuperação
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Email enviado com sucesso!
                  </h4>
                  <p className="text-gray-600 mb-1">
                    Enviamos um link de recuperação para:
                  </p>
                  <p className="text-primary-500 font-medium mb-4">
                    {forgotPasswordEmail}
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Verifique sua caixa de entrada e spam. O link expira em 24 horas.
                  </p>
                  <button
                    onClick={closeModal}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Voltar ao Login
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!emailSent && (
              <div className="px-6 pb-6">
                <p className="text-xs text-center text-gray-500">
                  Lembrou sua senha?{' '}
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
                  >
                    Voltar ao login
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;
