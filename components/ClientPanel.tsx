import React from 'react';
import { useApp } from '../services/store';
import { useNavigate } from 'react-router-dom';
import { MapPin, Gift, Search, Copy, ArrowRight, Store, User } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { CompanyCardImage } from './Avatar';

export const ClientExplore: React.FC = () => {
  const { companies } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter companies based on search query
  const filteredCompanies = companies.filter(c =>
    searchQuery.trim() === '' ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.benefit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gradient-primary">Explorar Benefícios</h2>
        <p className="text-gray-500">Descubra empresas parceiras e aproveite seus descontos exclusivos.</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar empresas, descontos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border-0 shadow-sm rounded-2xl text-gray-700 outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {filteredCompanies.length === 0 ? (
        <EmptyState
          icon={Store}
          title={searchQuery ? "Nenhum resultado encontrado" : "Nenhuma empresa parceira disponível"}
          description={searchQuery ? "Tente buscar por outros termos ou limpe o filtro." : "No momento não há empresas parceiras cadastradas. Em breve você terá acesso a benefícios exclusivos."}
          variant="default"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map(c => (
            <div
              key={c.id}
              onClick={() => navigate(`/painel/empresas/${c.slug}`)}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Header with company image covering full area */}
              <div className="h-48 relative overflow-hidden">
                <CompanyCardImage src={c.image} alt={c.name} className="group-hover:scale-105 transition-transform duration-500" />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Company name */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <h3 className="text-white font-bold text-xl leading-tight line-clamp-2">{c.name}</h3>
                </div>
                {/* Arrow icon on hover */}
                <div className="absolute top-3 right-3 z-10 bg-white/20 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="px-5 pt-5 pb-5">

                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-2.5 rounded-xl shrink-0">
                    <Gift className="w-6 h-6 text-gradient-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gradient-primary uppercase tracking-wide text-[10px] mb-0.5">Benefício</p>
                    <p className="text-gray-800 font-medium leading-snug">{c.benefit}</p>
                  </div>
                </div>

                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{c.description}</p>

                <div className="flex items-center gap-2 text-xs text-gray-400 pt-4 border-t border-gray-50">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{c.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ClientCard: React.FC = () => {
  const { currentUser } = useApp();

  if (!currentUser) return null;

  // Generate a QR code URL
  const qrData = JSON.stringify({ id: currentUser.id, code: currentUser.memberCode });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&color=0f172a`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8">
      <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden relative border border-gray-100">
        {/* Card Header Background with Avatar */}
        <div className="h-44 bg-gradient-primary relative overflow-hidden flex flex-col items-center justify-center">
           <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <div className="relative z-10">
             <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm p-1 shadow-lg">
               {currentUser.avatar ? (
                 <img 
                   src={currentUser.avatar} 
                   alt={currentUser.name} 
                   className="w-full h-full rounded-full object-cover"
                 />
               ) : (
                 <div className="w-full h-full rounded-full bg-white/30 flex items-center justify-center">
                   <User className="w-8 h-8 text-white" />
                 </div>
               )}
             </div>
           </div>
        </div>

        <div className="py-6 px-8 text-center">
           <h2 className="text-2xl font-bold text-gray-900">{currentUser.name}</h2>
           <p className="text-gray-400 text-sm mb-6">{currentUser.email}</p>

           {/* Status Indicator */}
           <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8 ${
             currentUser.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
           }`}>
              <span className={`w-2 h-2 rounded-full ${currentUser.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              {currentUser.isActive ? 'Assinatura Ativa' : 'Assinatura Inativa'}
           </div>

           {/* QR Code */}
           <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-300 mx-auto w-fit mb-6">
              <img src={qrUrl} alt="QR Code" className="w-48 h-48 mix-blend-multiply" />
           </div>

           {/* Manual Code */}
           <div className="space-y-2">
             <p className="text-xs text-gray-400 uppercase tracking-widest">Código do Membro</p>
             <div className="flex items-center justify-center gap-3">
               <span className="text-2xl font-mono font-bold text-gray-800 tracking-wider">{currentUser.memberCode}</span>
               <button className="text-gray-400 hover:text-primary-600" title="Copiar">
                 <Copy className="w-4 h-4" />
               </button>
             </div>
           </div>
        </div>
      </div>
      <p className="mt-6 text-gray-400 text-sm max-w-xs text-center">Apresente este QR Code nos estabelecimentos parceiros para garantir seus benefícios.</p>
    </div>
  );
};