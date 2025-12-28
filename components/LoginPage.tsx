import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../services/store';
import { useToast } from './Toast';
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

  const handleSendResetEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) return;
    
    // Simular envio de email
    setTimeout(() => {
      setEmailSent(true);
    }, 800);
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-400 via-blue-400 to-blue-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bS0yMCAwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        
        {/* Decorative circles */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -mb-48 -ml-48"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-40 right-40 w-40 h-40 bg-white opacity-10 rounded-full"></div>
        
        {/* Illustration Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
            {/* Door illustration */}
            <div className="relative">
              <div className="w-48 h-72 bg-gradient-to-b from-gray-100 to-gray-200 rounded-3xl shadow-xl relative overflow-hidden">
                {/* Door panels */}
                <div className="absolute inset-4 flex gap-2">
                  <div className="flex-1 bg-white rounded-xl shadow-inner"></div>
                  <div className="flex-1 bg-white rounded-xl shadow-inner"></div>
                </div>
                {/* Door handle */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-8 bg-gray-400 rounded-full shadow-md"></div>
              </div>
              
              {/* Person illustration */}
              <div className="absolute -right-16 top-1/2 -translate-y-1/2">
                <div className="relative">
                  {/* Head */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full relative">
                    <div className="absolute top-3 left-3 w-10 h-10 bg-blue-500 rounded-full"></div>
                  </div>
                  {/* Body */}
                  <div className="mt-2 w-16 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-500 rounded-b-full"></div>
                  </div>
                  {/* Arms */}
                  <div className="absolute top-20 -left-2 w-6 h-16 bg-blue-700 rounded-full -rotate-12"></div>
                  <div className="absolute top-20 -right-2 w-6 h-16 bg-blue-700 rounded-full rotate-45"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="mt-12 text-white text-center">
            <h2 className="text-4xl font-bold mb-4">Bem-vindo de volta!</h2>
            <p className="text-lg text-white/80">Acesse sua conta e aproveite os benefícios</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isRegister ? 'CRIAR CONTA' : 'LOGIN'}
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
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                    className="font-medium text-blue-600 hover:text-blue-500"
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
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="font-medium text-blue-600 hover:text-blue-500"
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
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Registrar-se
                  </button>
                </>
              )}
            </div>

            {/* Demo Credentials Info */}
            {!isRegister && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
                <p className="font-semibold mb-1">Credenciais de teste:</p>
                <p><strong>Admin:</strong> admin@accesspass.com</p>
                <p><strong>Empresa:</strong> empresa@accesspass.com</p>
                <p><strong>Cliente:</strong> cliente@accesspass.com</p>
                <p className="mt-1"><strong>Senha:</strong> Test@123</p>
              </div>
            )}
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-500">
            © 2025 AccessPass. Todos os direitos reservados.
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
              <h3 className="text-2xl font-bold text-gray-900">
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
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="seu@email.com"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Link de Recuperação
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
                  <p className="text-blue-600 font-medium mb-4">
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
                    className="text-blue-600 hover:text-blue-500 font-medium"
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
