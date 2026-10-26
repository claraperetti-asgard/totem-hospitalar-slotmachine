import { useEffect, useRef, useState } from 'react';
import LogoHospitalar from '../assets/logo-hospitalar-branco.png';
import { ArrowLeft, Heart } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { loadGameSettings, type GameSettings } from '../config/gameSettings';

// Dimensões lógicas do tabuleiro (px)
const BOARD_W = 760;
const BOARD_H = 870;
const SLOTS = 5;
const SLOT_W = BOARD_W / SLOTS;
const PEG_R = 7;
const BALL_R = 14;
const ROWS = 12;
const PEG_GAP_X = 76;
const PEG_GAP_Y = 62;
const PEG_TOP = 70;
const LAST_PEG_Y = PEG_TOP + (ROWS - 1) * PEG_GAP_Y;
const GRAVITY = 0.35;
const BOUNCE = 0.5;
const MAX_VX = 6;
const MAX_VY = 12;
const STEP_MS = 1000 / 60;

// Caçapas com a logo (prêmio); as outras levam o coração
const LOGO_SLOTS = [0, 2, 4];
const HEART_SLOTS = [1, 3];

type Peg = { x: number; y: number };
type Ball = { x: number; y: number; vx: number; vy: number };
type Phase = 'playing' | 'result';

const PEGS: Peg[] = Array.from({ length: ROWS }).flatMap((_, row) => {
    const offset = row % 2 === 0 ? PEG_GAP_X / 2 : PEG_GAP_X;
    const count = row % 2 === 0 ? 10 : 9;
    return Array.from({ length: count }, (_, i) => ({
        x: offset + i * PEG_GAP_X,
        y: PEG_TOP + row * PEG_GAP_Y,
    }));
});

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

function drawBoard(canvas: HTMLCanvasElement | null, ball: Ball | null) {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, BOARD_W, BOARD_H);

    ctx.shadowColor = 'rgba(120, 210, 255, 0.9)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#7fd3f7';
    for (const peg of PEGS) {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, PEG_R, 0, Math.PI * 2);
        ctx.fill();
    }

    if (ball) {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
}

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

function moveBall(ball: Ball, targetX: number) {
    // Abaixo dos pinos, acomoda a bola suavemente na caçapa sorteada
    if (ball.y > LAST_PEG_Y + PEG_R + BALL_R) {
        const pull = targetX - ball.x;
        ball.vx += clamp(pull * 0.15 - ball.vx * 0.2, -3, 3);
    }

    ball.vy += GRAVITY;
    ball.vx = clamp(ball.vx, -MAX_VX, MAX_VX);
    ball.vy = clamp(ball.vy, -MAX_VY, MAX_VY);
    ball.x += ball.vx;
    ball.y += ball.vy;

    for (const peg of PEGS) {
        const dx = ball.x - peg.x;
        const dy = ball.y - peg.y;
        const dist = Math.hypot(dx, dy);
        const minDist = PEG_R + BALL_R;
        if (dist < minDist && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;
            ball.x = peg.x + nx * minDist;
            ball.y = peg.y + ny * minDist;
            const dot = ball.vx * nx + ball.vy * ny;
            if (dot < 0) {
                ball.vy = (ball.vy - 2 * dot * ny) * BOUNCE;

                // Em cada pino a bola desvia para um lado. Quanto menos fileiras
                // faltam para alcançar a caçapa sorteada, mais ela tende a ir na direção dela.
                const need = targetX - ball.x;
                const rowsLeft = Math.max(1, Math.ceil((LAST_PEG_Y - peg.y) / PEG_GAP_Y));
                const urgency = clamp(Math.abs(need) / (rowsLeft * 25), 0, 1);
                const toward = Math.abs(need) < 6 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(need);
                const dir = Math.random() < 0.5 + 0.5 * urgency ? toward : -toward;
                ball.vx = dir * (1.5 + Math.random() * 1.2);
            }
        }
    }

    if (ball.x < BALL_R) {
        ball.x = BALL_R;
        ball.vx = Math.abs(ball.vx) * BOUNCE;
    } else if (ball.x > BOARD_W - BALL_R) {
        ball.x = BOARD_W - BALL_R;
        ball.vx = -Math.abs(ball.vx) * BOUNCE;
    }
}

// Sorteia a caçapa final (logo = prêmio) e a posição de saída da bola
function planDrop(winChance: number, slot?: number) {
    const start = slot ?? Math.floor(Math.random() * SLOTS);
    // Só caçapas a até 2 colunas de distância, para a bola descer sem desvios forçados
    const slots = Math.random() < winChance ? LOGO_SLOTS : HEART_SLOTS;
    const target = pick(slots.filter((s) => Math.abs(s - start) <= 2));
    return {
        targetX: SLOT_W / 2 + target * SLOT_W + (Math.random() - 0.5) * 40,
        ball: {
            x: SLOT_W / 2 + start * SLOT_W + (Math.random() - 0.5) * 12,
            y: BALL_R,
            vx: 0,
            vy: 0,
        } as Ball,
    };
}

export default function Roleta() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ballRef = useRef<Ball | null>(null);
    const targetXRef = useRef(0);
    const frameRef = useRef<number>(0);
    const lastTimeRef = useRef(0);
    const accRef = useRef(0);
    const [settings] = useState<GameSettings>(() => loadGameSettings());
    const [phase, setPhase] = useState<Phase>('playing');
    const [isPlaying, setIsPlaying] = useState(false);
    const [result, setResult] = useState<number | null>(null);
    const [attemptsUsed, setAttemptsUsed] = useState(0);
    const navigate = useNavigate();

    const won = result !== null && LOGO_SLOTS.includes(result);
    const attemptsLeft = settings.maxAttempts - attemptsUsed;

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/');
        }, 60000);

        return () => clearTimeout(timer);
    }, [phase]);

    useEffect(() => {
        if (phase === 'playing') drawBoard(canvasRef.current, ballRef.current);
        return () => cancelAnimationFrame(frameRef.current);
    }, [phase]);

    useEffect(() => {
        if (phase !== 'result' || !won) return;

        const colors = ['#ffffff', '#7fd3f7', '#0aa3e0'];
        confetti({ particleCount: 180, spread: 90, origin: { y: 0.5 }, colors });

        const end = Date.now() + 3000;
        let cancelled = false;
        const frame = () => {
            if (cancelled) return;
            confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
            confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
            if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();

        return () => {
            cancelled = true;
        };
    }, [phase, won]);

    // Física em passo fixo de 60 fps, independente da taxa de atualização da tela
    const step = (now: number) => {
        const ball = ballRef.current;
        if (!ball) return;

        const elapsed = lastTimeRef.current ? Math.min(now - lastTimeRef.current, 100) : STEP_MS;
        lastTimeRef.current = now;
        accRef.current += elapsed;
        while (accRef.current >= STEP_MS && ball.y < BOARD_H - BALL_R) {
            moveBall(ball, targetXRef.current);
            accRef.current -= STEP_MS;
        }

        drawBoard(canvasRef.current, ballRef.current);

        if (ball.y >= BOARD_H - BALL_R) {
            ball.y = BOARD_H - BALL_R;
            drawBoard(canvasRef.current, ballRef.current);
            setResult(clamp(Math.floor(ball.x / SLOT_W), 0, SLOTS - 1));
            setAttemptsUsed((v) => v + 1);
            setTimeout(() => {
                setIsPlaying(false);
                setPhase('result');
            }, 1500);
            return;
        }

        frameRef.current = requestAnimationFrame(step);
    };

    const handleDrop = (slot?: number) => {
        if (isPlaying) return;

        // O resultado é sorteado antes, conforme a chance definida no painel admin
        const drop = planDrop(settings.winChance, slot);
        targetXRef.current = drop.targetX;
        ballRef.current = drop.ball;
        lastTimeRef.current = 0;
        accRef.current = 0;
        setResult(null);
        setIsPlaying(true);
        cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(step);
    };

    const startGame = () => {
        ballRef.current = null;
        setResult(null);
        setPhase('playing');
    };

    return (
        <div className="relative flex flex-col w-full min-h-screen bg-[#045291] text-white items-center justify-start pt-8 pb-10 px-10 overflow-hidden">

            <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-[#0aa3e0]/40 blur-[160px] pointer-events-none" />

            <div className="relative w-full max-w-5xl flex justify-center items-center px-8 z-20">
                <NavLink
                    to="/"
                    className="absolute left-8 bg-white/10 border border-white/20 p-3 rounded-full"
                >
                    <ArrowLeft color="#ffffff" size={35} />
                </NavLink>

                {phase === 'playing' && (
                    <img
                        src={LogoHospitalar}
                        alt="Logo Hospitalar"
                        className="w-80 object-contain"
                    />
                )}
            </div>

            <div className={`relative z-10 flex flex-1 flex-col items-center gap-6 w-full ${phase === 'playing' ? 'justify-start pt-6' : 'justify-center'}`}>

                {phase === 'playing' && (
                    <>
                        <div className="text-center space-y-2 mb-14">
                            <h1 className="text-6xl font-black tracking-tight">PLINKO</h1>
                            <p className="text-3xl font-bold text-white/80 mt-2">
                                Toque em um <span className="text-[#7fd3f7] font-black">número</span> para soltar a bolinha
                            </p>
                        </div>

                        <div className="w-full max-w-[900px]">
                            <div className="flex">
                                {Array.from({ length: SLOTS }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleDrop(i)}
                                        disabled={isPlaying}
                                        className={`flex-1 py-3 text-4xl font-black transition-colors ${isPlaying ? 'text-white/30' : 'text-white animate-pulse active:text-[#7fd3f7]'}`}
                                    >
                                        {String(i + 1).padStart(2, '0')}
                                    </button>
                                ))}
                            </div>

                            <canvas
                                ref={canvasRef}
                                width={BOARD_W}
                                height={BOARD_H}
                                className="block w-full h-auto"
                            />

                            <div className="flex h-48 rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                                {Array.from({ length: SLOTS }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`
                                            flex-1 flex items-center justify-center border-white/30 transition-all duration-300
                                            ${i < SLOTS - 1 ? 'border-r-2' : ''}
                                            ${i % 2 === 0 ? 'bg-linear-to-b from-[#0aa3e0] to-[#0577c2]' : 'bg-linear-to-b from-[#5cc6f0] to-[#2a9ad8]'}
                                            ${result === i ? 'brightness-125 animate-pulse' : ''}
                                        `}
                                    >
                                        {LOGO_SLOTS.includes(i) ? (
                                            <img
                                                src={LogoHospitalar}
                                                alt="Hospitalar"
                                                className="w-40 max-w-none -rotate-90 object-contain"
                                            />
                                        ) : (
                                            <Heart size={64} color="#ffffff" strokeWidth={2.5} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {phase === 'result' && (
                    <div className="flex flex-col items-center gap-10 text-center animate-fade-in-up">
                        <img
                            src={LogoHospitalar}
                            alt="Logo Hospitalar"
                            className="w-110 object-contain drop-shadow-[0_0_25px_rgba(127,211,247,0.6)]"
                        />

                        {won ? (
                            <div className="space-y-6">
                                
                                <h1 className="text-7xl font-black leading-tight">
                                    Parabéns, você ganhou<br />
                                    <span className="text-[#7fd3f7]">um brinde</span><br />
                                    da Hospitalar
                                </h1>
                                <p className="text-4xl font-bold text-white/90 pt-4">
                                    Retire seu brinde no <span className="text-[#7fd3f7] font-black">estande da Hospitalar</span>
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h1 className="text-7xl font-black leading-tight">
                                    Não foi dessa vez
                                </h1>
                                <p className="text-5xl font-black text-[#7fd3f7]">
                                    {attemptsLeft > 0 ? 'Tente novamente!' : 'Obrigado por participar!'}
                                </p>
                                {attemptsLeft > 0 && (
                                    <p className="text-2xl text-white/60">
                                        {attemptsLeft === 1
                                            ? 'Você ainda tem 1 tentativa'
                                            : `Você ainda tem ${attemptsLeft} tentativas`}
                                    </p>
                                )}
                            </div>
                        )}

                        {!won && attemptsLeft > 0 ? (
                            <button
                                onClick={startGame}
                                className="mt-4 px-16 py-6 rounded-full bg-white text-[#045291] text-4xl font-black shadow-[0_0_50px_rgba(127,211,247,0.7)] active:scale-95 transition-all"
                            >
                                Tentar Novamente
                            </button>
                        ) : (
                            <NavLink
                                to="/"
                                className="mt-4 px-16 py-6 rounded-full bg-white text-[#045291] text-4xl font-black shadow-[0_0_50px_rgba(127,211,247,0.7)] active:scale-95 transition-all"
                            >
                                Finalizar
                            </NavLink>
                        )}
                    </div>
                )}

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
