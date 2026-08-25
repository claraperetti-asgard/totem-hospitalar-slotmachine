import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";
import LogoHospitalar from "../assets/logo-hospitalar-branco.png";

export default function EndScreen() {
    const { state } = useLocation();

    const status = state?.status

    useEffect(() => {
        if (status !== "win") return;

        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#045291', '#ffffff', '#9fd0ff']
        });

        const duration = 3 * 1000;
        const end = Date.now() + duration;

        let cancelled = false;

        const frame = () => {
            if (cancelled) return;

            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#9fd0ff', '#ffffff']
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#9fd0ff', '#ffffff']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();

        return () => {
            cancelled = true;
        };
    }, [status]);

    return (
        <div className="relative min-h-screen w-full flex flex-col justify-center items-center text-white overflow-hidden bg-[#045291]">

            <div className="absolute w-150 h-150 bg-white/20 blur-[150px] rounded-full -top-25 animate-pulse"></div>
            <div className="absolute w-100 h-100 bg-white/10 blur-[120px] rounded-full -bottom-25 -right-25"></div>

            <div className="relative z-10 flex flex-col items-center text-center p- gap-6 max-w-4xl">

                <div>
                    <img
                        src={LogoHospitalar}
                        alt="Logo Hospitalar"
                        className="w-120 h-fit object-contain -mt-18 -mb-12"
                    />
                </div>

                {status === "win" ?
                    <div className="space-y-4 animate-fade-in-up">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                            Parabéns! Você conseguiu obter 3 figuras iguais no<br />
                            <span className="text-[#9fd0ff]">
                                Slot Machine
                            </span>!
                        </h1>
                    </div>
                    :
                    <div className="space-y-4 animate-fade-in-up">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                            Você não conseguiu obter 3 figuras iguais no<br />
                            <span className="text-[#9fd0ff]">
                                Slot Machine
                            </span>!
                        </h1>
                    </div>
                }

                <NavLink
                    to="/"
                    className="mt-12 px-12 py-4 rounded-full font-bold text-3xl bg-white text-black shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:scale-110 active:scale-95 transition-all duration-300"
                >
                    Jogar Novamente
                </NavLink>

            </div>

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
            `}</style>
        </div>
    );
}