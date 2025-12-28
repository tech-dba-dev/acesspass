import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useApp } from '../../services/store';
import { ArrowLeft, Building2, MapPin, Percent } from 'lucide-react';

export const CompanyDetailPage = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const { companies } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('companies');

  const company = companies.find(c => c.slug === companySlug);

  if (!company) {
    return (
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="text-center py-20">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Empresa não encontrada</h2>
          <p className="text-gray-600 mb-6">A empresa que você procura não existe.</p>
          <button
            onClick={() => navigate('/painel/admin/empresas')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Empresas
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/painel/admin/empresas')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Detalhes da Empresa</h1>
        </div>

        {/* Company Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-700 relative">
            <img
              src={company.image}
              alt={company.name}
              className="w-full h-full object-cover mix-blend-overlay"
            />
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{company.name}</h2>
            <p className="text-gray-600 mb-4">{company.description}</p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Percent className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Benefício</p>
                  <p className="text-lg font-bold text-green-600">{company.benefit}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Endereço</p>
                  <p className="text-blue-600">{company.address}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
              <div className="grid gap-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Slug</span>
                  <span className="font-mono text-sm text-gray-900">{company.slug}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Ativa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
