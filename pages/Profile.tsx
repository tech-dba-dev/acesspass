import React, { useState, useRef } from 'react';
import { useApp } from '../services/store';
import { useToast } from '../components/Toast';
import { Avatar } from '../components/Avatar';
import { User, Lock, Eye, EyeOff, CheckCircle, Camera, RefreshCw } from 'lucide-react';

export const Profile: React.FC = () => {
  const { currentUser, updateUser, updateOwnAvatar } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [birthDate, setBirthDate] = useState(currentUser?.birthDate || '');
  const [msg, setMsg] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  if (!currentUser) return null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Arquivo muito grande. Máximo: 5MB', 'error');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione uma imagem válida', 'error');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const result = await updateOwnAvatar(file);
      if (result.success) {
        showToast('Foto atualizada com sucesso!', 'success');
      } else {
        showToast(result.error || 'Erro ao atualizar foto', 'error');
      }
    } catch (error) {
      showToast('Erro ao atualizar foto', 'error');
    } finally {
      setIsUploadingAvatar(false);
      // Reset input
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleSave = () => {
    updateUser({ ...currentUser, name, phone, birthDate });
    setMsg('Perfil atualizado com sucesso!');
    setTimeout(() => setMsg(''), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validações
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Por favor, preencha todos os campos');
      return;
    }

    if (passwordData.currentPassword !== currentUser.password) {
      setPasswordError('Senha atual incorreta');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      setPasswordError('A nova senha deve ser diferente da atual');
      return;
    }

    // Atualizar senha
    updateUser({ ...currentUser, password: passwordData.newPassword });
    setPasswordSuccess('Senha alterada com sucesso!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    setTimeout(() => {
      setPasswordSuccess('');
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gradient-primary mb-6">Meu Perfil</h2>
      
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-all ${
            activeTab === 'profile'
              ? 'bg-gradient-primary text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Dados Pessoais
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-all ${
            activeTab === 'password'
              ? 'bg-gradient-primary text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          Trocar Senha
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
              <div className="relative group flex-shrink-0">
                  <Avatar
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    size="xl"
                    className="ring-4 ring-gray-50"
                  />
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isUploadingAvatar ? (
                      <RefreshCw className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <div className="text-center text-white">
                        <Camera className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs font-medium">Alterar</span>
                      </div>
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
              </div>
              <div className="text-center md:text-left flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 truncate">{currentUser.name}</h3>
                  <p className="text-gray-500 truncate">{currentUser.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full uppercase">
                      {currentUser.role === 'company' ? 'COMPANY (Empresa)' : currentUser.role}
                  </span>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="block mt-2 mx-auto md:mx-0 text-sm text-gradient-primary hover:opacity-80 font-medium disabled:opacity-50 transition"
                  >
                    {isUploadingAvatar ? 'Enviando...' : 'Trocar foto de perfil'}
                  </button>
              </div>
          </div>

          <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none"
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Não editável)</label>
                  <input
                      value={currentUser.email}
                      disabled
                      className="w-full p-3 border border-gray-200 bg-gray-50 text-gray-500 rounded-xl"
                  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex: (11) 98765-4321"
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                    <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none"
                    />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                  {msg && (
                    <span className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      {msg}
                    </span>
                  )}
                  <button 
                      onClick={handleSave}
                      className="ml-auto bg-gradient-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gradient-primary-hover transition"
                  >
                      Salvar Alterações
                  </button>
              </div>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Alterar Senha</h3>
            <p className="text-sm text-gray-500">
              Por segurança, informe sua senha atual para definir uma nova senha
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-5">
            {/* Senha Atual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha Atual
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none"
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Nova Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none"
                  placeholder="Digite sua nova senha (mín. 6 caracteres)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Nova Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none"
                  placeholder="Confirme sua nova senha"
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

            {/* Error Message */}
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {passwordError}
              </div>
            )}

            {/* Success Message */}
            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {passwordSuccess}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-gradient-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-gradient-primary-hover transition"
              >
                Alterar Senha
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};