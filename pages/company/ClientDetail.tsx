import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { supabase } from '../../services/supabase';
import { User as UserType } from '../../types';
import { ArrowLeft, User, Mail, CreditCard, Phone, Cake, Loader2 } from 'lucide-react';

// Simple cache for client data
const clientCache = new Map<string, { data: UserType; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const CompanyClientDetailPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('history');
  const [client, setClient] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId) return;

      // Check cache first
      const cached = clientCache.get(clientId);
      const now = Date.now();

      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setClient(cached.data);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', clientId)
          .eq('role', 'client')
          .single();

        if (error || !data) {
          console.log('Client not found:', error?.message);
          setClient(null);
        } else {
          const clientData: UserType = {
            id: data.id,
            name: data.name,
            email: data.email,
            password: '',
            role: data.role,
            avatar: data.avatar,
            isActive: data.is_active,
            companyId: data.company_id,
            memberCode: data.member_code,
            birthDate: data.birth_date,
            phone: data.phone,
          };

          setClient(clientData);

          // Store in cache
          clientCache.set(clientId, { data: clientData, timestamp: now });
        }
      } catch (err) {
        console.error('Error fetching client:', err);
        setClient(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  if (isLoading) {
    return (
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="text-center py-20">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cliente não encontrado</h2>
          <p className="text-gray-600 mb-6">O cliente que você procura não existe.</p>
          <button
            onClick={() => navigate('/painel/parceiro/historico')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:bg-gradient-primary-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Histórico
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
            onClick={() => navigate('/painel/parceiro/historico')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <h1 className="text-3xl font-bold text-gradient-primary">Perfil do Cliente</h1>
        </div>

        {/* Client Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 md:p-8 text-white">
            <div className="flex items-start gap-4 md:gap-6">
              <div className="flex-shrink-0">
                {client.avatar ? (
                  <img
                    src={client.avatar}
                    alt={client.name}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg bg-white/20 flex items-center justify-center text-white font-bold text-xl md:text-2xl">
                    {client.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h2 className="text-xl md:text-2xl font-bold truncate">{client.name}</h2>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium w-fit ${
                    client.isActive
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    {client.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="text-primary-100 truncate text-sm md:text-base">{client.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* QR Code */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-sm text-gray-600 font-medium mb-4">QR Code do Cliente</p>
                  <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({ id: client.id, code: client.memberCode }))}&color=0f172a`}
                      alt="QR Code"
                      className="w-40 h-40 mix-blend-multiply"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-lg">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <p className="text-xl font-bold text-purple-700 font-mono">{client.memberCode}</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Phone and Birth Date */}
              <div className="space-y-6">
                {/* Phone */}
                {client.phone && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-500 rounded-xl">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Telefone</p>
                        <p className="text-xl font-semibold text-green-700">{client.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Birth Date */}
                {client.birthDate && (
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-orange-500 rounded-xl">
                        <Cake className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Data de Nascimento</p>
                        <p className="text-xl font-semibold text-orange-700">
                          {(() => {
                            // Fix timezone issue by adding time to the date
                            const [year, month, day] = client.birthDate.split('-');
                            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                            return date.toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            });
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
