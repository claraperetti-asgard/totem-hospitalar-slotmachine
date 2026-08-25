import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoHospitalar from '../assets/logo-hospitalar.png';
import { CheckCircle2 } from 'lucide-react';

export default function Final() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white gap-12 p-10 text-center">
            <img src={LogoHospitalar} className="h-42 w-auto object-contain" alt="Logo" />

            <div className="flex flex-col items-center gap-8 bg-[#003e82]/10 rounded-[40px] shadow-2xl px-16 py-20 max-w-3xl">
                <CheckCircle2 size={120} color="#0262b0" strokeWidth={2} />

                <h1 className="text-5xl font-extrabold text-[#003e82] leading-tight">
                    Cadastro concluído!
                </h1>

                <p className="text-3xl font-semibold text-gray-700 leading-relaxed">
                    Você ganhou um dos{' '}
                    <span className="text-[#0262b0] font-extrabold"> 4 copos colecionáveis </span>
                </p>
            </div>
        </div>
    );
}
