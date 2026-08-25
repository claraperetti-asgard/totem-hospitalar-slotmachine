import { useEffect, useState, useRef } from 'react';
import LogoHospitalar from '../assets/logo-hospitalar.png';
import * as XLSX from 'xlsx'
import { apiUrl } from '../api';

type Lead = {
    id: number
    name: string
    cpf: string
    created_at: string
}

// O banco guarda o CPF so com digitos; aqui ele volta a aparecer formatado.
function formatCPF(cpf: string) {
    const digits = String(cpf || '').replace(/\D/g, '')
    if (digits.length !== 11) return cpf
    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
}

export default function Relatorio() {
    const [leads, setLeads] = useState<Lead[]>()
    const [showAuthModal, setShowAuthModal] = useState(true)
    const [password, setPassword] = useState('')
    const [authError, setAuthError] = useState('')
    const [isAuthenticating, setIsAuthenticating] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [shake, setShake] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    const tableColumns = [
        "Nome",
        "CPF",
        "Data"
    ]

    useEffect(() => {
        if (showAuthModal && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [showAuthModal])

    async function handleAuth() {
        if (!password.trim()) {
            setAuthError('Digite a senha para continuar.')
            triggerShake()
            return
        }

        setIsAuthenticating(true)
        setAuthError('')

        try {
            const response = await fetch(apiUrl('/auth'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })

            if (!response.ok) {
                setAuthError('Senha incorreta. Tente novamente.')
                setPassword('')
                triggerShake()
                inputRef.current?.focus()
                return
            }

            setIsAuthenticated(true)
            setShowAuthModal(false)
            getLeads()
        } catch {
            setAuthError('Erro de conexão com o servidor.')
            triggerShake()
        } finally {
            setIsAuthenticating(false)
        }
    }

    function triggerShake() {
        setShake(true)
        setTimeout(() => setShake(false), 500)
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') handleAuth()
    }

    function getLeads() {
        const query = new URLSearchParams();

        if (startDate && endDate) {
            query.set('startDate', startDate);
            query.set('endDate', endDate);
        }

        const queryString = query.toString();
        const url = queryString
            ? `${apiUrl('/leads')}?${queryString}`
            : apiUrl('/leads');

        fetch(url, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' },
        })
        .then((response) => {
            if (!response.ok) throw new Error('Erro na requisição');
            return response.json();
        })
        .then((data) => setLeads(data))
        .catch((error) => console.error("Houve um problema:", error));
    }

    const downloadLeads = async () => {
        const dateToday = new Date().toLocaleDateString().replace(/\//g, '-');
        try {
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(
                (leads || []).map((lead) => ({
                    Nome: lead.name,
                    CPF: formatCPF(lead.cpf),
                    Data: lead.created_at,
                }))
            );
            XLSX.utils.book_append_sheet(workbook, worksheet, "Leads")
            XLSX.writeFile(workbook, `leads_hospitalares-${dateToday}.xlsx`);
        } catch (error) {
            console.error("Erro ao baixar leads:", error);
        }
    }

    return (
        <div className="relative flex flex-col w-full min-h-screen p-8 bg-gray-50 gap-8">
            {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div
                        className={`relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col gap-6 border border-gray-100
                            ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}
                        `}
                        style={shake ? { animation: 'shake 0.4s ease-in-out' } : {}}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-[#0c498a]/10 flex items-center justify-center">
                                <svg className="w-8 h-8 text-[#0c498a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mt-1">Insira a senha para acessar o relatório de leads.</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Senha</label>
                            <input
                                ref={inputRef}
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                                onKeyDown={handleKeyDown}
                                placeholder="••••••••"
                                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all
                                    ${authError ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#0c498a]/20 focus:border-[#0c498a]'}
                                `}
                            />
                            {authError && (
                                <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {authError}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleAuth}
                            disabled={isAuthenticating}
                            className="w-full py-3 bg-[#0c498a] hover:bg-[#093a6e] disabled:opacity-60 transition-colors rounded-xl text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2"
                        >
                            {isAuthenticating ? "Verificando..." : "Acessar Relatório"}
                        </button>
                    </div>
                </div>
            )}

            <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Relatório de Leads</h1>
                </div>
                <img src={LogoHospitalar} alt="Logo Hospitalar" className="h-12 object-contain" />
            </header>

            <section className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100 flex flex-col">
                <div className="p-6 border-b border-gray-100 bg-white flex flex-wrap items-end justify-between gap-4">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Data Início</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#0c498a]/20 outline-none transition-all bg-gray-50"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Data Fim</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#0c498a]/20 outline-none transition-all bg-gray-50"
                            />
                        </div>
                        <button
                            onClick={getLeads}
                            disabled={!isAuthenticated}
                            className="cursor-pointer px-6 py-2.5 bg-gray-800 text-white hover:bg-black transition-all rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-20"
                        >
                            Filtrar
                        </button>
                    </div>

                    <button
                        onClick={downloadLeads}
                        disabled={!isAuthenticated || !leads}
                        className="cursor-pointer px-6 py-2.5 bg-[#0c498a] hover:bg-[#093a6e] disabled:opacity-40 transition-colors rounded-xl text-white font-medium text-sm shadow-md flex items-center gap-2"
                    >
                        <span>Baixar dados</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                {tableColumns.map((column) => (
                                    <th key={column} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {!isAuthenticated ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-16 text-center text-gray-400 text-sm">
                                        <div className="flex flex-col items-center gap-2">
                                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Autentique-se para visualizar os dados
                                        </div>
                                    </td>
                                </tr>
                            ) : leads?.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-sm">
                                        Nenhum lead encontrado no período selecionado.
                                    </td>
                                </tr>
                            ) : (
                                leads?.map((lead, index) => (
                                    <tr className="hover:bg-blue-50/30 transition-colors group" key={`${lead.cpf}-${index}`}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800 text-center">{lead.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 text-center">{formatCPF(lead.cpf)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 text-center">
                                            {new Date(lead.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%       { transform: translateX(-8px); }
                    40%       { transform: translateX(8px); }
                    60%       { transform: translateX(-6px); }
                    80%       { transform: translateX(6px); }
                }
            `}</style>
        </div>
    );
}