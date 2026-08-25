import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import LogoHospitalar from "../../assets/logo-hospitalar-branco.png";
import type { GameSettings } from "../../config/gameSettings";

type Props = {
    settings: GameSettings;
    onSave: (settings: GameSettings) => void;
    onClose: () => void;
};

const MIN_ATTEMPTS = 1;
const MAX_ATTEMPTS_LIMIT = 10;
const CHANCE_STEP = 5;

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

// preenche a barra até a posição atual
const trackStyle = (value: number, min: number, max: number) => {
    const percent = ((value - min) / (max - min)) * 100;

    return {
        background: `linear-gradient(to right, #67e8f9 ${percent}%, rgba(255,255,255,0.2) ${percent}%)`,
    };
};

export default function AcessoAdmin({ settings, onSave, onClose }: Props) {
    const [attempts, setAttempts] = useState(settings.maxAttempts);
    const [chance, setChance] = useState(Math.round(settings.winChance * 100));
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        onSave({ maxAttempts: attempts, winChance: chance / 100 });

        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#045291] text-white overflow-y-auto">
            <div className="min-h-screen w-full flex flex-col items-center px-8 py-14 gap-12">
                <div className="relative w-full max-w-5xl flex justify-center items-center">
                    <img
                        src={LogoHospitalar}
                        alt="Logo Hospitalar"
                        className="w-110 object-contain"
                    />

                    <button
                        onClick={onClose}
                        className="absolute right-0 bg-white/10 border border-white/20 p-3 rounded-full"
                    >
                        <X color="#ffffff" size={35} />
                    </button>
                </div>

                <div className="text-center space-y-3">
                    <h1 className="text-5xl font-black tracking-tight">
                        Painel do Administrador
                    </h1>
                    <p className="text-white/60 text-2xl">
                        Configurações da Slot Machine
                    </p>
                </div>

                <div className="w-full max-w-3xl bg-white/10 border border-white/20 rounded-3xl p-10 space-y-14">
                    {/* ---------- TENTATIVAS ---------- */}
                    <div className="space-y-6">
                        <div className="flex items-end justify-between gap-6">
                            <div>
                                <h2 className="text-3xl font-bold">
                                    Tentativas por pessoa
                                </h2>
                                <p className="text-white/60 text-xl">
                                    Quantos giros cada participante pode dar.
                                </p>
                            </div>

                            <span className="text-6xl font-black text-cyan-200 leading-none">
                                {attempts}
                            </span>
                        </div>

                        <div className="flex items-center gap-6">
                            <button
                                onClick={() =>
                                    setAttempts((v) =>
                                        clamp(v - 1, MIN_ATTEMPTS, MAX_ATTEMPTS_LIMIT)
                                    )
                                }
                                className="shrink-0 bg-white/15 border border-white/25 rounded-full p-5 active:bg-white/30"
                            >
                                <Minus color="#ffffff" size={34} />
                            </button>

                            <input
                                type="range"
                                className="slot-range"
                                min={MIN_ATTEMPTS}
                                max={MAX_ATTEMPTS_LIMIT}
                                step={1}
                                value={attempts}
                                onChange={(e) => setAttempts(Number(e.target.value))}
                                style={trackStyle(
                                    attempts,
                                    MIN_ATTEMPTS,
                                    MAX_ATTEMPTS_LIMIT
                                )}
                            />

                            <button
                                onClick={() =>
                                    setAttempts((v) =>
                                        clamp(v + 1, MIN_ATTEMPTS, MAX_ATTEMPTS_LIMIT)
                                    )
                                }
                                className="shrink-0 bg-white/15 border border-white/25 rounded-full p-5 active:bg-white/30"
                            >
                                <Plus color="#ffffff" size={34} />
                            </button>
                        </div>

                        <div className="flex justify-between text-white/50 text-lg px-1">
                            <span>{MIN_ATTEMPTS}</span>
                            <span>{MAX_ATTEMPTS_LIMIT}</span>
                        </div>
                    </div>

                    {/* ---------- CHANCE DE GANHAR ---------- */}
                    <div className="space-y-6">
                        <div className="flex items-end justify-between gap-6">
                            <div>
                                <h2 className="text-3xl font-bold">Chance de ganhar</h2>
                                <p className="text-white/60 text-xl">
                                    Porcentagem de acerto em cada giro.
                                </p>
                            </div>

                            <span className="text-6xl font-black text-cyan-200 leading-none">
                                {chance}%
                            </span>
                        </div>

                        <div className="flex items-center gap-6">
                            <button
                                onClick={() =>
                                    setChance((v) => clamp(v - CHANCE_STEP, 0, 100))
                                }
                                className="shrink-0 bg-white/15 border border-white/25 rounded-full p-5 active:bg-white/30"
                            >
                                <Minus color="#ffffff" size={34} />
                            </button>

                            <input
                                type="range"
                                className="slot-range"
                                min={0}
                                max={100}
                                step={CHANCE_STEP}
                                value={chance}
                                onChange={(e) => setChance(Number(e.target.value))}
                                style={trackStyle(chance, 0, 100)}
                            />

                            <button
                                onClick={() =>
                                    setChance((v) => clamp(v + CHANCE_STEP, 0, 100))
                                }
                                className="shrink-0 bg-white/15 border border-white/25 rounded-full p-5 active:bg-white/30"
                            >
                                <Plus color="#ffffff" size={34} />
                            </button>
                        </div>

                        <div className="flex justify-between text-white/50 text-lg px-1">
                            <span>0%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    {/* ---------- AÇÕES ---------- */}
                    <div className="flex flex-col items-center gap-5">
                        <button
                            onClick={handleSave}
                            className="w-full px-12 py-5 bg-white text-[#045291] text-3xl font-black rounded-full"
                        >
                            Salvar
                        </button>

                        {saved && (
                            <p className="text-cyan-200 text-2xl font-bold">
                                Configurações salvas!
                            </p>
                        )}

                        <button
                            onClick={onClose}
                            className="text-white/60 text-xl underline"
                        >
                            Voltar para o jogo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
