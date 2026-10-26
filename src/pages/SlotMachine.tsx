import { useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import LogoHospitalar from "../assets/logo-hospitalar-branco.png";
import { NavLink, useNavigate } from "react-router-dom";
import {
    loadGameSettings,
    type GameSettings,
} from "../config/gameSettings";

const symbols = [
    "/card-hospital.jpeg",
    "/card-simbolo.jpeg",
    "/card-logo.jpeg",
    "/card-coracao.jpeg",
    "/card-servico.jpeg",
];

const CELL = 240;          
const REEL_W = 260;       
const REPEATS = 14;       
const L = symbols.length;

const STRIP = Array.from({ length: REPEATS * L }, (_, i) => symbols[i % L]);

const centerPos = (t: number) => (t - 1 + L) % L;

const SPIN_MS = [2200, 2800, 3400];

export default function SlotMachine() {
    // tentativas e chance de vitória vêm do painel admin (tela do formulário)
    const [settings] = useState<GameSettings>(() => loadGameSettings());
    const MAX_ATTEMPTS = settings.maxAttempts;
    const WIN_CHANCE = settings.winChance;

    const [positions, setPositions] = useState([
        centerPos(0),
        centerPos(1),
        centerPos(2),
    ]);
    const [snap, setSnap] = useState(false);
    const [spinning, setSpinning] = useState(false);
    const [won, setWon] = useState(false);
    const [message, setMessage] = useState("");
    const [attempts, setAttempts] = useState(0);

    const posRef = useRef(positions);
    const navigate = useNavigate();

    const getRandomSymbol = () => Math.floor(Math.random() * L);

    const drawResult = () => {
        if (Math.random() < WIN_CHANCE) {
            const s = getRandomSymbol();
            return [s, s, s];
        }

        const a = getRandomSymbol();
        const b = getRandomSymbol();
        let c = getRandomSymbol();

        if (a === b && b === c) {
            c = (c + 1 + Math.floor(Math.random() * (L - 1))) % L;
        }

        return [a, b, c];
    };

    const spin = () => {
        if (spinning) return;
        if (attempts >= MAX_ATTEMPTS) return;

        setSpinning(true);
        setWon(false);
        setSnap(false);
        setMessage("Girando...");

        const target = drawResult();

        const next = posRef.current.map((pos, i) => {
            const loops = 6 + i * 2;
            const base = pos + loops * L;
            const delta = (centerPos(target[i]) - (base % L) + L) % L;
            return base + delta;
        });

        posRef.current = next;
        setPositions(next);

        window.setTimeout(() => {
            const normalized = target.map(centerPos);
            posRef.current = normalized;
            setSnap(true);
            setPositions(normalized);
            requestAnimationFrame(() => setSnap(false));

            const isThreeEqual = target[0] === target[1] && target[1] === target[2];

            if (isThreeEqual) {
                setWon(true);
                setMessage("GANHOU");
                setSpinning(false);

                setTimeout(() => {
                    navigate("/final", { state: { status: "win" } });
                }, 1000);

                return;
            }

            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= MAX_ATTEMPTS) {
                setMessage("Perdeu");
                setSpinning(false);

                setTimeout(() => {
                    navigate("/final", { state: { status: "lost" } });
                }, 1000);

                return;
            }

            setMessage(`Tentativa ${newAttempts}/${MAX_ATTEMPTS}`);
            setSpinning(false);
        }, SPIN_MS[SPIN_MS.length - 1] + 150);
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-start bg-[#045291] text-white px-6 gap-10 pt-15 relative">
            <div className="relative w-full max-w-5xl flex justify-center items-center px-8">
                <NavLink
                    to="/"
                    className="absolute left-8 bg-white/10 border border-white/20 p-3 rounded-full"
                >
                    <ArrowLeft color="#ffffff" size={35} />
                </NavLink>

                <img
                    src={LogoHospitalar}
                    alt="Logo Nemidian"
                    className="w-110 object-contain"
                />
            </div>

            <h1 className="text-5xl font-bold text-white ">
                SLOT MACHINE
            </h1>

            <div className="text-white/60 text-xl">
                Tentativa: {attempts}/{MAX_ATTEMPTS}
            </div>

            {/* ---------- MÁQUINA ---------- */}
            <div className="relative">
                {/* brilho ambiente atrás do gabinete */}
                <div
                    className={`absolute -inset-10 rounded-[3.5rem] blur-3xl transition-colors duration-500 ${
                        won ? "bg-cyan-300/40" : "bg-cyan-300/15"
                    }`}
                />

                {/* gabinete */}
                <div className="relative rounded-[2.75rem] p-6 bg-gradient-to-b from-[#d7edf9] via-[#8fc6e4] to-[#3f86b4] shadow-[0_30px_70px_rgba(0,0,0,0.45),inset_0_3px_0_rgba(255,255,255,0.9),inset_0_-4px_10px_rgba(0,0,0,0.25)]">
                    {/* luzes laterais */}
                    <div
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 h-[45%] w-2.5 rounded-full bg-cyan-100 shadow-[0_0_22px_7px_rgba(103,232,249,0.85)]"
                        style={{ animation: "slot-glow 1.8s ease-in-out infinite" }}
                    />
                    <div
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 h-[45%] w-2.5 rounded-full bg-cyan-100 shadow-[0_0_22px_7px_rgba(103,232,249,0.85)]"
                        style={{ animation: "slot-glow 1.8s ease-in-out infinite .9s" }}
                    />

                    {/* barra de luz superior */}
                    <div className="mx-auto mb-5 h-2.5 w-[82%] rounded-full bg-cyan-100 shadow-[0_0_20px_5px_rgba(103,232,249,0.75)]" />

                    {/* moldura interna escura */}
                    <div className="relative rounded-3xl bg-[#07345e] p-3.5 shadow-[inset_0_8px_22px_rgba(0,0,0,0.65)]">
                        <div className="flex gap-3.5">
                            {positions.map((pos, i) => (
                                <div
                                    key={i}
                                    className="relative overflow-hidden rounded-2xl bg-white shadow-[inset_0_0_0_2px_rgba(7,52,94,0.25)]"
                                    style={{ width: REEL_W, height: CELL * 3 }}
                                >
                                    {/* fita de símbolos */}
                                    <div
                                        className="will-change-transform"
                                        style={{
                                            transform: `translate3d(0, ${-pos * CELL}px, 0)`,
                                            transitionProperty: "transform",
                                            transitionDuration: snap ? "0ms" : `${SPIN_MS[i]}ms`,
                                            transitionTimingFunction:
                                                "cubic-bezier(0.12, 0.62, 0.16, 1)",
                                            filter: spinning ? "blur(1.5px)" : "none",
                                        }}
                                    >
                                        {STRIP.map((src, j) => (
                                            <div
                                                key={j}
                                                className="overflow-hidden"
                                                style={{ height: CELL }}
                                            >
                                                <img
                                                    src={src}
                                                    className="block w-full h-full object-cover object-center"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* curvatura do cilindro */}
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#04305a]/55 via-transparent to-[#04305a]/55" />
                                    {/* reflexo lateral do vidro */}
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/45 via-transparent to-[#04305a]/15" />

                                    {/* linha de pagamento */}
                                    <div
                                        className={`pointer-events-none absolute left-0 right-0 border-y transition-colors duration-300 ${
                                            won
                                                ? "border-cyan-300 bg-cyan-200/25"
                                                : "border-[#07345e]/15"
                                        }`}
                                        style={{ top: CELL, height: CELL }}
                                    />

                                    {/* brilho de vitória */}
                                    {won && (
                                        <div
                                            className="pointer-events-none absolute left-0 right-0 bg-cyan-200/50"
                                            style={{
                                                top: CELL,
                                                height: CELL,
                                                animation:
                                                    "slot-win-flash .5s ease-in-out infinite",
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* reflexo diagonal que percorre o vidro */}
                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                            <div
                                className="h-full w-1/4 bg-white/12"
                                style={{ animation: "slot-shine 4.5s ease-in-out infinite" }}
                            />
                        </div>
                    </div>

                    {/* barra de luz inferior */}
                    <div className="mx-auto mt-5 h-2.5 w-[82%] rounded-full bg-cyan-100 shadow-[0_0_20px_5px_rgba(103,232,249,0.75)]" />
                </div>
            </div>

            <p>{message}</p>

            <button
                onClick={spin}
                disabled={spinning || attempts >= MAX_ATTEMPTS}
                className="px-12 py-4 bg-white text-black text-3xl font-bold rounded-full"
            >
                {spinning ? "Girando..." : "Girar"}
            </button>

            <div className="space-y-4 mt-12 ">
                <h1 className="text-5xl md:text-5xl font-black tracking-tight leading-tight">
                    Acerte 3 iguais e ganhe um prêmio!
                </h1>
            </div>

        </div>
    );
}
