import { useState } from 'react';
import RoletaFoto from '../assets/roleta.jpg';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Roleta() {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const navigate = useNavigate();


    const handleSpin = () => {
        if (isSpinning) return;
        setIsSpinning(true);
        const newRotation = rotation + Math.floor(Math.random() * 4000) + 2000;
        setRotation(newRotation);

        setTimeout(() => {
            setIsSpinning(false);
        }, 3000);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/');
        }, 60000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col w-full min-h-screen bg-slate-50 items-center justify-around py-12 px-10 overflow-hidden">

            <div className='flex justify-end items-center w-full max-w-6xl z-20'>
                <NavLink to={'/'} className="p-4 bg-white rounded-full shadow-md hover:bg-slate-100 transition-all active:scale-95 text-slate-400">
                    <ArrowLeft size={60} color='#0262b0' />
                </NavLink>
            </div>

            <div className='relative flex flex-col justify-center items-center gap-6'>

                <div className="z-10 animate-bounce -mb-5">
                    <ChevronDown size={70} color='#0262b0' strokeWidth={4} />
                </div>

                <div className="relative p-4 bg-white rounded-full shadow-[0_20px_60px_rgba(2,98,176,0.3)] border-8 border-white">
                    <img
                        src={RoletaFoto}
                        className="w-190 h-190 rounded-full object-cover shadow-inner"
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transition: 'transform 3s cubic-bezier(0.15, 0, 0.15, 1)'
                        }}
                        alt="Roleta"
                    />
                </div>
            </div>

            <button
                onClick={handleSpin}

                className={`
        group relative flex justify-center items-center px-20 py-9 mt-10 gap-4 text-4xl font-black rounded-full text-white shadow-2xl transition-all active:scale-90
        ${(isSpinning) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0262b0] hover:bg-[#014d8a]'}
    `}
            >
                <span className="drop-shadow-md">
                    {isSpinning ? 'Girando...' : 'GIRAR'}
                </span>
                {!isSpinning && (
                    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                )}
            </button>

        </div>
    );
}

