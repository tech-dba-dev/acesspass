import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useApp } from '../../services/store';
import { ArrowLeft, Building2, MapPin, Percent, Tag, Phone, Globe, Mail } from 'lucide-react';

export const ClientCompanyDetailPage = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const { companies } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('explore');

  const company = companies.find(c => c.slug === companySlug);

  if (!company) {
    return (
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="text-center py-20">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Empresa não encontrada</h2>
          <p className="text-gray-600 mb-6">A empresa que você procura não existe.</p>
          <button
            onClick={() => navigate('/painel')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Explorar
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
            onClick={() => navigate('/painel')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Detalhes do Parceiro</h1>
        </div>

        {/* Company Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Image */}
          <div className="h-64 bg-gradient-to-br from-primary-500 to-primary-700 relative overflow-hidden">
            <img
              src={company.image}
              alt={company.name}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-3xl font-bold text-white mb-2">{company.name}</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                  Parceiro AccessPass
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Sobre</h3>
              <p className="text-gray-600 leading-relaxed">{company.description}</p>
            </div>

            {/* Benefits Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seu Benefício Exclusivo</h3>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-500 rounded-xl">
                    <Percent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Desconto disponível</p>
                    <p className="text-2xl font-bold text-green-700">{company.benefit}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Apresente seu código AccessPass no estabelecimento para garantir seu desconto
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Localização</h3>
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">{company.address}</p>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(company.address)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 mt-1 inline-block">
                    Ver no mapa →
                  </a>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Pronto para usar seu benefício?</h3>
              <p className="text-primary-100 mb-4">
                Acesse sua carteirinha digital e mostre seu código único no estabelecimento
              </p>
              <button
                onClick={() => navigate('/painel/carteirinha')}
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                Ver Minha Carteirinha
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
