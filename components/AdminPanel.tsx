import React, { useState, useRef } from 'react';
import { useApp, User } from '../services/store';
import { useNavigate } from 'react-router-dom';
import { Company } from '../types';
import { Plus, Edit2, Trash2, MapPin, Tag, Check, X, Search, Building, Eye, Upload, Image as ImageIcon, EyeOff, RefreshCw, Copy, ChevronLeft, ChevronRight, UserCircle } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { useToast } from './Toast';
import { Avatar, CompanyImage } from './Avatar';

export const AdminCompanies: React.FC = () => {
  const { companies, addCompany, updateCompany, deleteCompany } = useApp();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; company: Company | null }>({ isOpen: false, company: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 20;

  const [formData, setFormData] = useState<Partial<Company>>({
    name: '', description: '', benefit: '', address: '', image: '', isActive: true
  });

  // Filter and pagination
  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.benefit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name?.trim()) {
      showToast('Nome da empresa é obrigatório', 'error');
      return;
    }
    
    if (!formData.benefit?.trim()) {
      showToast('Benefício é obrigatório', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editId) {
        // Update existing company
        const company = companies.find(c => c.id === editId);
        if (company) {
          const result = await updateCompany(
            { ...company, ...formData } as Company,
            imageFile || undefined
          );
          
          if (result.success) {
            showToast('Empresa atualizada com sucesso!', 'success');
            resetForm();
          } else {
            showToast(result.error || 'Erro ao atualizar empresa', 'error');
          }
        }
      } else {
        // Create new company
        const slug = generateSlug(formData.name || '');
        const newCompany: Partial<Company> = {
          slug,
          name: formData.name || 'Nova Empresa',
          description: formData.description || '',
          benefit: formData.benefit || '',
          address: formData.address || '',
          isActive: true
        };
        
        const result = await addCompany(newCompany, imageFile || undefined);
        
        if (result.success) {
          showToast('Empresa criada com sucesso!', 'success');
          resetForm();
        } else {
          showToast(result.error || 'Erro ao criar empresa', 'error');
        }
      }
    } catch (error) {
      console.error('Error submitting company:', error);
      showToast('Erro ao salvar empresa', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditId(null);
    setImagePreview('');
    setImageFile(null);
    setFormData({ name: '', description: '', benefit: '', address: '', image: '', isActive: true });
  };

  const handleEdit = (c: Company) => {
    setFormData(c);
    setEditId(c.id);
    setImagePreview(c.image);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (c: Company) => {
    setDeleteModal({ isOpen: true, company: c });
  };

  const confirmDelete = async () => {
    if (deleteModal.company) {
      setIsSubmitting(true);
      try {
        const result = await deleteCompany(deleteModal.company.id);
        
        if (result.success) {
          showToast('Empresa excluída com sucesso!', 'success');
          setDeleteModal({ isOpen: false, company: null });
        } else {
          showToast(result.error || 'Erro ao excluir empresa', 'error');
        }
      } catch (error) {
        console.error('Error deleting company:', error);
        showToast('Erro ao excluir empresa', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, company: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Empresas</h2>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition"
        >
          <Plus className="w-4 h-4" /> Nova Empresa
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={resetForm}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">
                {editId ? 'Editar Empresa' : 'Nova Empresa'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="overflow-y-auto flex-1 p-6 bg-white">
              <form onSubmit={handleSubmit} className="space-y-6" id="company-form">

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Imagem da Empresa
                  </label>

                  <div className="max-w-md">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 transition-all cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 overflow-hidden"
                    >
                      {imagePreview ? (
                        <>
                          {/* Image Preview */}
                          <div className="h-32 w-full">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-center text-white">
                              <Upload className="w-5 h-5 mx-auto mb-1" />
                              <p className="text-xs font-medium">Clique para alterar</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="h-32 w-full flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <Upload className="w-7 h-7 mx-auto mb-2" />
                            <p className="text-xs font-medium mb-1">Clique para fazer upload</p>
                            <p className="text-[10px]">PNG, JPG ou WEBP até 5MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Nome da Empresa
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Burger King Partners"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                {/* Benefit */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Benefício/Desconto
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: 20% OFF on all Combo Meals"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                    value={formData.benefit || ''}
                    onChange={e => setFormData({...formData, benefit: e.target.value})}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Descrição
                  </label>
                  <textarea
                    placeholder="Descreva a empresa, seus produtos e serviços..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none transition"
                    rows={4}
                    value={formData.description || ''}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Endereço
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Av. Paulista, 1000 - São Paulo, SP"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                    value={formData.address || ''}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 shrink-0 bg-white">
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="company-form"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {editId ? 'Atualizando...' : 'Criando...'}
                  </>
                ) : (
                  editId ? 'Atualizar' : 'Criar Empresa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          placeholder="Buscar empresas..."
          value={searchQuery}
          onChange={e => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Table */}
      {paginatedCompanies.length === 0 ? (
        <EmptyState
          icon={Building}
          title={companies.length === 0 ? "Nenhuma empresa cadastrada" : "Nenhuma empresa encontrada"}
          description={
            companies.length === 0
              ? "Comece adicionando sua primeira empresa parceira ao sistema."
              : "Tente ajustar os filtros de busca ou limpar a pesquisa."
          }
          variant={companies.length === 0 ? 'default' : 'search'}
          action={companies.length === 0 ? {
            label: "Adicionar Primeira Empresa",
            onClick: () => { resetForm(); setIsModalOpen(true); }
          } : undefined}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Empresa</th>
                  <th className="px-6 py-4">Benefício</th>
                  <th className="px-6 py-4">Endereço</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCompanies.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <CompanyImage src={c.image} alt={c.name} size="sm" />
                        <div>
                          <div className="font-medium text-gray-900">{c.name}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{c.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-primary-600 text-sm font-medium">
                        <Tag className="w-3.5 h-3.5" />
                        {c.benefit}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                        <MapPin className="w-3.5 h-3.5" />
                        {c.address || 'Não informado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/painel/admin/empresas/${c.slug}`)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Ver Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(c)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredCompanies.length)} de {filteredCompanies.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.company && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={cancelDelete}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              {/* Icon */}
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Excluir Empresa
              </h3>

              {/* Message */}
              <p className="text-gray-600 text-center mb-6">
                Tem certeza que deseja excluir <span className="font-semibold">{deleteModal.company.name}</span>? Esta ação não pode ser desfeita.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    'Excluir'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminClients: React.FC = () => {
  const { users, companies, addUser, updateUser, deleteUser, toggleUserActive, migrateMemberCodes } = useApp();
  const { showToast } = useToast();
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const itemsPerPage = 20;

  // Combine logic for users: companies need a companyId, clients need memberCode
  const [formData, setFormData] = useState<Partial<User>>({
    name: '', email: '', role: 'client', isActive: true, memberCode: '', companyId: '', password: '', phone: '', birthDate: ''
  });

  const filteredUsers = users.filter(u =>
    u.role !== 'admin' &&
    (u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filter changes
  const handleFilterChange = (value: string) => {
    setFilter(value);
    setCurrentPage(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (editingId) {
        const existing = users.find(u => u.id === editingId);
        if (existing) {
          const result = await updateUser(
            {...existing, ...formData} as User,
            formData.password || undefined
          );
          if (result.success) {
            showToast('Usuário atualizado com sucesso!', 'success');
            resetForm();
          } else {
            showToast(result.error || 'Erro ao atualizar usuário', 'error');
          }
        }
      } else {
        if (!formData.password) {
          showToast('Senha é obrigatória para novos usuários', 'error');
          setIsSubmitting(false);
          return;
        }
        
        const userData: Partial<User> = {
          name: formData.name || 'User',
          email: formData.email || '',
          role: formData.role || 'client',
          isActive: formData.isActive ?? true,
          companyId: formData.role === 'company' ? formData.companyId : undefined,
          phone: formData.phone,
          birthDate: formData.birthDate
        };
        
        const result = await addUser(userData, formData.password);
        if (result.success) {
          showToast('Usuário criado com sucesso!', 'success');
          resetForm();
        } else {
          showToast(result.error || 'Erro ao criar usuário', 'error');
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Erro inesperado', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({...formData, password});
  };

  const copyPassword = () => {
    if (formData.password) {
      navigator.clipboard.writeText(formData.password);
      // You could add a toast notification here
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setShowPassword(false);
    setFormData({ name: '', email: '', role: 'client', isActive: true, companyId: '', password: '', phone: '', birthDate: '' });
  };

  const openEdit = (u: User) => {
    setFormData({...u, password: ''}); // Don't show existing password
    setEditingId(u.id);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (u: User) => {
    setDeleteModal({ isOpen: true, user: u });
  };

  const confirmDelete = async () => {
    if (deleteModal.user && !isDeleting) {
      setIsDeleting(true);
      try {
        const result = await deleteUser(deleteModal.user.id);
        if (result.success) {
          showToast('Usuário excluído com sucesso!', 'success');
          setDeleteModal({ isOpen: false, user: null });
        } else {
          showToast(result.error || 'Erro ao excluir usuário', 'error');
        }
      } catch (error: any) {
        showToast(error.message || 'Erro inesperado', 'error');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleToggleActive = async (user: User) => {
    if (togglingUserId) return;
    
    setTogglingUserId(user.id);
    try {
      const result = await toggleUserActive(user.id, !user.isActive);
      if (result.success) {
        showToast(
          user.isActive ? 'Usuário desativado com sucesso!' : 'Usuário ativado com sucesso!',
          'success'
        );
      } else {
        showToast(result.error || 'Erro ao alterar status', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Erro inesperado', 'error');
    } finally {
      setTogglingUserId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, user: null });
  };

  const handleMigrateCodes = async () => {
    if (isMigrating) return;
    
    setIsMigrating(true);
    try {
      const result = await migrateMemberCodes();
      if (result.success) {
        showToast(`Códigos migrados com sucesso! ${result.updated} atualizados.`, 'success');
      } else {
        showToast(result.error || 'Erro ao migrar códigos', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Erro inesperado', 'error');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Usuários</h2>
        <div className="flex gap-2">
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition"
          >
            <Plus className="w-4 h-4" /> Novo Usuário
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          placeholder="Buscar usuários..."
          value={filter}
          onChange={e => handleFilterChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={resetForm}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="overflow-y-auto flex-1 p-6 bg-white">
              <form onSubmit={handleSubmit} className="space-y-6" id="user-form">

                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Nome Completo
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: João da Silva"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="Ex: joao@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                    value={formData.email || ''}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                {/* Phone and Birth Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      placeholder="Ex: (11) 98765-4321"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                      value={formData.phone || ''}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                      value={formData.birthDate || ''}
                      onChange={e => setFormData({...formData, birthDate: e.target.value})}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {editingId ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={editingId ? 'Digite uma nova senha...' : 'Digite a senha...'}
                      className="w-full px-4 py-3 pr-32 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                      value={formData.password || ''}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      required={!editingId}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        title="Gerar senha aleatória"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      {formData.password && (
                        <button
                          type="button"
                          onClick={copyPassword}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Copiar senha"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {formData.password && (
                    <p className="text-xs text-gray-500">
                      Dica: Use uma senha forte com letras, números e símbolos
                    </p>
                  )}
                </div>

                {/* Role and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Função
                    </label>
                    <select
                      value={formData.role || 'client'}
                      onChange={e => setFormData({...formData, role: e.target.value as any, companyId: ''})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white"
                      disabled={!!editingId}
                    >
                      <option value="client">Cliente</option>
                      <option value="company">Empresa (Gerente)</option>
                    </select>
                    {editingId && (
                      <p className="text-xs text-gray-500">A função não pode ser alterada após a criação</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Status
                    </label>
                    <select
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={e => setFormData({...formData, isActive: e.target.value === 'active'})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                </div>

                {/* Company Link (only if role is company) */}
                {formData.role === 'company' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Vincular Empresa
                    </label>
                    <select
                      required
                      value={formData.companyId || ''}
                      onChange={e => setFormData({...formData, companyId: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white"
                    >
                      <option value="">Selecione uma empresa...</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 shrink-0 bg-white">
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="user-form"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSubmitting ? 'Salvando...' : (editingId ? 'Atualizar' : 'Criar Usuário')}
              </button>
            </div>
          </div>
        </div>
      )}

      {paginatedUsers.length === 0 ? (
        <EmptyState
          icon={UserCircle}
          title={filteredUsers.length === 0 ? "Nenhum usuário cadastrado" : "Nenhum usuário encontrado"}
          description={
            filteredUsers.length === 0
              ? "Comece adicionando o primeiro usuário (cliente ou empresa) ao sistema."
              : "Tente ajustar os filtros de busca ou limpar a pesquisa."
          }
          variant={filteredUsers.length === 0 ? 'default' : 'search'}
          action={filteredUsers.length === 0 ? {
            label: "Adicionar Primeiro Usuário",
            onClick: () => { resetForm(); setIsModalOpen(true); }
          } : undefined}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Função</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedUsers.map(u => {
                  const linkedCompany = u.role === 'company' ? companies.find(c => c.id === u.companyId) : null;
                  return (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.avatar} alt={u.name} size="sm" className="w-9 h-9" />
                        <div>
                          <div className="font-medium text-gray-900">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'company' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role === 'company' ? 'Empresa' : 'Cliente'}
                      </span>
                      {linkedCompany && (
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Building className="w-3 h-3" /> {linkedCompany.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                       <button
                         onClick={() => handleToggleActive(u)}
                         disabled={togglingUserId === u.id}
                         className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition hover:opacity-80 disabled:opacity-50 ${
                          u.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                         title={u.isActive ? 'Clique para desativar' : 'Clique para ativar'}
                       >
                        {togglingUserId === u.id ? (
                          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        )}
                        {u.isActive ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(u)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredUsers.length)} de {filteredUsers.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={!isDeleting ? cancelDelete : undefined}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              {/* Icon */}
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Excluir Usuário
              </h3>

              {/* Message */}
              <p className="text-gray-600 text-center mb-6">
                Tem certeza que deseja excluir <span className="font-semibold">{deleteModal.user.name}</span>? Esta ação não pode ser desfeita.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting && (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};