import React, { useState, useRef, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useApp, Company } from '../../services/store';
import { useToast } from '../../components/Toast';
import { CompanyImage } from '../../components/Avatar';
import { 
  Building2, 
  MapPin, 
  Percent, 
  Upload, 
  Save, 
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export const CompanyDataPage = () => {
  const { currentUser, companies, updateCompany } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('company-data');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Get the company associated with the current user
  const company = companies.find(c => c.id === currentUser?.companyId);

  const [formData, setFormData] = useState<Partial<Company>>({
    name: '',
    description: '',
    benefit: '',
    address: '',
    image: '',
  });

  // Load company data when available
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        description: company.description || '',
        benefit: company.benefit,
        address: company.address,
        image: company.image || '',
      });
      setImagePreview(company.image || '');
    }
  }, [company]);

  // Track changes
  useEffect(() => {
    if (company) {
      const changed = 
        formData.name !== company.name ||
        formData.description !== (company.description || '') ||
        formData.benefit !== company.benefit ||
        formData.address !== company.address ||
        imageFile !== null;
      setHasChanges(changed);
    }
  }, [formData, imageFile, company]);

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
    
    if (!company) {
      showToast('Empresa não encontrada', 'error');
      return;
    }

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
      const updatedCompany: Company = {
        ...company,
        name: formData.name || company.name,
        description: formData.description || null,
        benefit: formData.benefit || company.benefit,
        address: formData.address || company.address,
      };

      const result = await updateCompany(updatedCompany, imageFile || undefined);
      
      if (result.success) {
        showToast('Dados da empresa atualizados com sucesso!', 'success');
        setImageFile(null);
        setHasChanges(false);
      } else {
        showToast(result.error || 'Erro ao atualizar dados da empresa', 'error');
      }
    } catch (error) {
      console.error('Error updating company:', error);
      showToast('Erro ao salvar dados da empresa', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (company) {
      setFormData({
        name: company.name,
        description: company.description || '',
        benefit: company.benefit,
        address: company.address,
        image: company.image || '',
      });
      setImagePreview(company.image || '');
      setImageFile(null);
      setHasChanges(false);
    }
  };

  // If no company is associated
  if (!company) {
    return (
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="text-center py-20">
          <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Empresa não vinculada</h2>
          <p className="text-gray-600">
            Sua conta não está vinculada a nenhuma empresa.
            <br />
            Entre em contato com o administrador.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient-primary">Dados da Empresa</h1>
            <p className="text-gray-500 mt-1">Gerencie as informações da sua empresa</p>
          </div>
          {hasChanges && (
            <span className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
              <AlertCircle className="w-4 h-4" />
              Alterações não salvas
            </span>
          )}
        </div>

        {/* Current Status Card */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
              {imagePreview ? (
                <img src={imagePreview} alt={formData.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white/50" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{formData.name || 'Nome da Empresa'}</h2>
              <p className="text-white/80 text-sm mt-1 line-clamp-2">
                {formData.description || 'Sem descrição'}
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="inline-flex items-center gap-1.5 text-sm bg-white/20 px-3 py-1 rounded-full">
                  <Percent className="w-3.5 h-3.5" />
                  {formData.benefit || 'Sem benefício'}
                </span>
                {formData.address && (
                  <span className="inline-flex items-center gap-1.5 text-sm bg-white/20 px-3 py-1 rounded-full">
                    <MapPin className="w-3.5 h-3.5" />
                    {formData.address}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Imagem da Empresa
              </label>
              <div className="flex items-start gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 transition-all cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 overflow-hidden flex-shrink-0"
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-center text-white">
                          <Upload className="w-5 h-5 mx-auto mb-1" />
                          <p className="text-xs font-medium">Alterar</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Upload className="w-6 h-6 mx-auto mb-1" />
                        <p className="text-xs">Upload</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  <p className="font-medium text-gray-700 mb-1">Dicas para uma boa imagem:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Use uma imagem quadrada ou horizontal</li>
                    <li>• Resolução mínima recomendada: 400x300px</li>
                    <li>• Formatos: PNG, JPG ou WEBP</li>
                    <li>• Tamanho máximo: 5MB</li>
                  </ul>
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
                Nome da Empresa <span className="text-red-500">*</span>
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
                Benefício/Desconto <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="Ex: 20% OFF em todos os combos"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                value={formData.benefit || ''}
                onChange={e => setFormData({...formData, benefit: e.target.value})}
              />
              <p className="text-xs text-gray-500">
                Este é o benefício que os clientes verão ao acessar sua empresa.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Descrição
              </label>
              <textarea
                placeholder="Descreva sua empresa, produtos e serviços..."
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

            {/* Read-only Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Informações do Sistema
              </h4>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Slug:</span>
                  <span className="ml-2 font-mono text-gray-700">{company.slug}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 inline-flex items-center gap-1 ${company.isActive !== false ? 'text-green-600' : 'text-red-600'}`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    {company.isActive !== false ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                * Essas informações são gerenciadas pelo administrador do sistema.
              </p>
            </div>
          </div>

          {/* Form Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting || !hasChanges}
              className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Descartar Alterações
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="px-6 py-2.5 bg-gradient-primary text-white rounded-lg hover:bg-gradient-primary-hover font-medium shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
