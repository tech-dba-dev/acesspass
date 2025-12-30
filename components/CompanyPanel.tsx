import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../services/store';
import { supabase } from '../services/supabase';
import { User, ValidationLog } from '../types';
import { ScanLine, Search, CheckCircle2, XCircle, Clock, Calendar, Eye, Filter, ChevronLeft, ChevronRight, History, Camera, CameraOff, X, User as UserIcon } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

export const CompanyValidator: React.FC = () => {
  const { currentUser, addLog } = useApp();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ user: User | null; status: 'idle' | 'success' | 'error' }>({ user: null, status: 'idle' });
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Format code as user types: XXX-XXXX-XX
  const formatMemberCode = (value: string): string => {
    // Remove everything except digits
    const digits = value.replace(/\D/g, '');
    
    // Apply format: XXX-XXXX-XX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 9)}`;
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMemberCode(e.target.value);
    setCode(formatted);
  };

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.log('Scanner already stopped');
      }
      scannerRef.current = null;
    }
  };

  const handleValidate = async (inputCode: string) => {
    if (isValidating) return;
    setIsValidating(true);

    // Try to parse QR data (JSON format)
    let memberCode = inputCode;
    try {
      const qrData = JSON.parse(inputCode);
      if (qrData.code) {
        memberCode = qrData.code;
      }
    } catch {
      // Not JSON, use as-is (manual input)
      memberCode = inputCode;
    }

    // Normalize code: remove spaces
    memberCode = memberCode.trim();
    
    // If user typed without dashes (e.g., 123456789), format it
    const digitsOnly = memberCode.replace(/[^0-9]/g, '');
    if (digitsOnly.length === 9 && !memberCode.includes('-')) {
      memberCode = `${digitsOnly.slice(0,3)}-${digitsOnly.slice(3,7)}-${digitsOnly.slice(7,9)}`;
    }

    console.log('Validating code:', memberCode);

    try {
      // Query the database directly for this member code
      const { data: clients, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('member_code', memberCode)
        .eq('role', 'client');

      console.log('Query result:', { clients, error });

      if (error || !clients || clients.length === 0) {
        console.log('Client not found:', error?.message || 'No matching client');
        setResult({ user: null, status: 'error' });
      } else {
        const clientData = clients[0];
        const client: User = {
          id: clientData.id,
          name: clientData.name,
          email: clientData.email,
          password: '',
          role: clientData.role,
          avatar: clientData.avatar,
          isActive: clientData.is_active,
          companyId: clientData.company_id,
          memberCode: clientData.member_code,
          birthDate: clientData.birth_date,
          phone: clientData.phone,
        };

        console.log('Client found:', client.name, 'Active:', client.isActive);
        setResult({ user: client, status: client.isActive ? 'success' : 'error' });
        
        // Log the attempt if we have a current company user
        if (currentUser?.companyId) {
          addLog({
              id: `log-${Date.now()}`,
              companyId: currentUser.companyId,
              companyName: 'Minha Empresa',
              clientId: client.id,
              clientName: client.name,
              timestamp: new Date().toISOString(),
              status: client.isActive ? 'success' : 'rejected'
          });
        }
      }
    } catch (err) {
      console.error('Validation error:', err);
      setResult({ user: null, status: 'error' });
    } finally {
      setIsValidating(false);
    }
  };

  const startScanner = async () => {
    setCameraError(null);
    setIsScanning(true);

    // Wait for DOM to render
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }

      const qrCodeSuccessCallback = (decodedText: string) => {
        // Stop scanner after successful scan
        stopScanner();
        setIsScanning(false);
        setCode(decodedText);
        handleValidate(decodedText);
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      // Try to use back camera first (better for QR codes), fallback to any camera
      try {
        await scannerRef.current.start(
          { facingMode: 'environment' },
          config,
          qrCodeSuccessCallback,
          () => {} // Ignore errors during scanning
        );
      } catch {
        // Fallback to any available camera
        await scannerRef.current.start(
          { facingMode: 'user' },
          config,
          qrCodeSuccessCallback,
          () => {}
        );
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setIsScanning(false);
      
      if (err.message?.includes('Permission')) {
        setCameraError('Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.');
      } else if (err.message?.includes('NotFoundError') || err.message?.includes('no camera')) {
        setCameraError('Nenhuma câmera encontrada no dispositivo.');
      } else {
        setCameraError('Erro ao acessar a câmera. Verifique as permissões do navegador.');
      }
    }
  };

  const cancelScanner = async () => {
    await stopScanner();
    setIsScanning(false);
    setCameraError(null);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
       <div className="text-center">
         <h2 className="text-2xl font-bold text-gradient-primary">Validar Acesso</h2>
         <p className="text-gray-500 mt-2">Escaneie o QR Code do cliente ou digite o código manualmente.</p>
       </div>

       {/* Results Display */}
       {result.status !== 'idle' && (
         <div className={`p-6 rounded-2xl border-2 text-center animate-in zoom-in-95 duration-200 ${
            result.status === 'success' ? 'border-emerald-100 bg-emerald-50' : 'border-rose-100 bg-rose-50'
         }`}>
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                result.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
                {result.status === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>
            
            {result.user ? (
                <>
                    <h3 className={`text-xl font-bold ${result.status === 'success' ? 'text-emerald-900' : 'text-rose-900'}`}>
                        {result.status === 'success' ? 'Acesso Liberado!' : 'Acesso Negado'}
                    </h3>
                    <p className={`text-sm mb-6 ${result.status === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {result.status === 'success' ? 'O cliente possui uma assinatura ativa.' : 'A assinatura deste cliente está inativa.'}
                    </p>

                    <div
                        onClick={() => navigate(`/painel/parceiro/clientes/${result.user?.id}`)}
                        className="bg-white/60 rounded-xl p-4 flex items-center gap-4 text-left hover:bg-white/80 cursor-pointer transition-colors group"
                    >
                        {result.user.avatar ? (
                          <img src={result.user.avatar} className="w-12 h-12 rounded-full bg-gray-200 object-cover" alt="" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {result.user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{result.user.name}</p>
                            <p className="text-xs text-gray-500">{result.user.email}</p>
                        </div>
                        <Eye className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                </>
            ) : (
                <h3 className="text-lg font-bold text-rose-900">Código Inválido ou Não Encontrado</h3>
            )}

            <button
                onClick={() => { setResult({user:null, status: 'idle'}); setCode(''); }}
                className="mt-6 text-sm underline opacity-60 hover:opacity-100"
            >
                Nova Validação
            </button>
         </div>
       )}

       {/* Input Area */}
       {result.status === 'idle' && (
        <div className="bg-white p-8 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100">
           {isScanning ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-700 font-medium flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary-500" />
                    Aponte para o QR Code
                  </p>
                  <button
                    onClick={cancelScanner}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div 
                  id="qr-reader" 
                  ref={scannerContainerRef}
                  className="w-full rounded-2xl overflow-hidden bg-black"
                  style={{ minHeight: '300px' }}
                />
                <p className="text-center text-sm text-gray-400">
                  Posicione o QR Code dentro da área de leitura
                </p>
              </div>
           ) : (
              <div className="space-y-6">
                {/* Camera Error */}
                {cameraError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <CameraOff className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-700 text-sm font-medium">Erro na câmera</p>
                      <p className="text-red-600 text-sm mt-1">{cameraError}</p>
                    </div>
                  </div>
                )}

                <button 
                  onClick={startScanner}
                  className="w-full py-6 border-2 border-dashed border-primary-200 bg-primary-50 rounded-2xl flex flex-col items-center gap-2 hover:bg-primary-100 hover:border-primary-300 transition group"
                >
                    <ScanLine className="w-8 h-8 text-primary-500 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-primary-700">Abrir Câmera</span>
                    <span className="text-xs text-primary-500">Escanear QR Code do cliente</span>
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-400">Ou digite o código</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <input 
                        value={code}
                        onChange={handleCodeChange}
                        placeholder="Ex: 123-4567-89"
                        maxLength={12}
                        className="flex-1 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-mono text-lg tracking-wider placeholder:font-sans placeholder:text-base placeholder:tracking-normal"
                    />
                    <button 
                        onClick={() => handleValidate(code)}
                        disabled={!code || code.length < 11}
                        className="bg-gray-900 text-white px-6 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Validar
                    </button>
                </div>
              </div>
           )}
        </div>
       )}
    </div>
  );
};

export const CompanyHistory: React.FC = () => {
  const { logs, currentUser } = useApp();
  const navigate = useNavigate();

  // Filter and pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | '7' | '15' | '30' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter logs for this company
  const companyLogs = logs.filter(l => l.companyId === currentUser?.companyId);

  // Apply fuzzy search
  const fuzzySearch = (text: string, query: string): boolean => {
    if (!query) return true;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    return lowerText.includes(lowerQuery);
  };

  // Apply date filter
  const applyDateFilter = (log: ValidationLog): boolean => {
    const logDate = new Date(log.timestamp);
    const now = new Date();

    if (dateFilter === 'all') return true;

    if (dateFilter === 'custom') {
      if (!startDate || !endDate) return true;
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return logDate >= start && logDate <= end;
    }

    const days = parseInt(dateFilter);
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return logDate >= cutoffDate;
  };

  // Apply all filters
  const filteredLogs = companyLogs
    .filter(log => fuzzySearch(log.clientName, searchQuery))
    .filter(applyDateFilter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gradient-primary">Histórico de Visitas</h2>
        <div className="text-sm text-gray-500">
          {filteredLogs.length} {filteredLogs.length === 1 ? 'registro' : 'registros'}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            placeholder="Buscar por nome do cliente..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange(); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setDateFilter('all'); handleFilterChange(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              dateFilter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => { setDateFilter('7'); handleFilterChange(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              dateFilter === '7'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Últimos 7 dias
          </button>
          <button
            onClick={() => { setDateFilter('15'); handleFilterChange(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              dateFilter === '15'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Últimos 15 dias
          </button>
          <button
            onClick={() => { setDateFilter('30'); handleFilterChange(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              dateFilter === '30'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Últimos 30 dias
          </button>
          <button
            onClick={() => setDateFilter('custom')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              dateFilter === 'custom'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Período customizado
          </button>
        </div>

        {/* Custom Date Range */}
        {dateFilter === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); handleFilterChange(); }}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); handleFilterChange(); }}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {paginatedLogs.length === 0 ? (
        <EmptyState
          icon={History}
          title={companyLogs.length === 0 ? "Nenhuma visita registrada" : "Nenhuma visita encontrada"}
          description={
            companyLogs.length === 0
              ? "Quando você validar QR Codes de clientes, o histórico aparecerá aqui."
              : "Tente ajustar os filtros de busca ou período para encontrar registros."
          }
          variant={companyLogs.length === 0 ? 'default' : 'filter'}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <>
            <div className="divide-y divide-gray-50">
              {paginatedLogs.map(log => {
                const date = new Date(log.timestamp);
                return (
                  <div
                    key={log.id}
                    onClick={() => navigate(`/painel/parceiro/clientes/${log.clientId}`)}
                    className="p-4 hover:bg-gray-50 transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{log.clientName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.status === 'success' ? 'Aprovado' : 'Rejeitado'}
                      </span>
                      <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredLogs.length)} de {filteredLogs.length}
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
                        // Show first page, last page, current page, and pages around current
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
          </>
        </div>
      )}
    </div>
  );
};