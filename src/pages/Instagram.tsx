import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import LogoHospitalar from '../assets/logo-hospitalar-branco.png';

// Perfil que o QR Code abre
const INSTAGRAM_URL = 'https://www.instagram.com/planodesaudehospitalar/';

export default function Instagram() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/');
        }, 60000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative flex flex-col w-full min-h-screen bg-[#045291] text-white items-center justify-start pt-8 pb-16 px-10 overflow-hidden">

            <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-[#0aa3e0]/40 blur-[160px] pointer-events-none" />

            <div className="relative w-full max-w-5xl flex justify-center items-center px-8 z-20">
                <NavLink
                    to="/"
                    className="absolute left-8 bg-white/10 border border-white/20 p-3 rounded-full"
                >
                    <ArrowLeft color="#ffffff" size={35} />
                </NavLink>

                <img
                    src={LogoHospitalar}
                    alt="Logo Hospitalar"
                    className="w-80 object-contain"
                />
            </div>

            <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-12 w-full text-center animate-fade-in-up">
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-4 text-[#7fd3f7]">
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" />
                            <circle cx="12" cy="12" r="4" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                        <p className="text-4xl font-black tracking-[0.3em]">INSTAGRAM</p>
                    </div>
                    <h1 className="text-7xl font-black leading-tight">
                        Siga a Hospitalar<br />
                        para jogar o <span className="text-[#7fd3f7]">Plinko</span>
                    </h1>
                </div>

                <div className="p-8 bg-white rounded-[40px] shadow-[0_0_60px_rgba(127,211,247,0.5)]">
                    <QRCodeSVG value={INSTAGRAM_URL} size={520} fgColor="#045291" />
                </div>

                <div className="space-y-3">
                    <p className="text-5xl font-black text-[#7fd3f7]">@planodesaudehospitalar</p>
                    <p className="text-3xl font-bold text-white/80">
                        Aponte a câmera do celular para o QR Code
                    </p>
                </div>

                <button
                    onClick={() => navigate('/roleta')}
                    className="px-24 py-7 rounded-full bg-white text-[#045291] text-5xl font-black shadow-[0_0_50px_rgba(127,211,247,0.7)] active:scale-95 transition-all"
                >
                    Jogar
                </button>
            </div>

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
            `}</style>
        </div>
    );
}
