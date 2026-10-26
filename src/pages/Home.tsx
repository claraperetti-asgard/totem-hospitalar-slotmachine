import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import VideoInicio from '../assets/video-inicio.mp4'
import LogoHospitalar from '../assets/logo-hospitalar-branco.png'
import AdminGear from '../components/layout/AdminGear'


export default function Home() {
  const [showIntro, setShowIntro] = useState(false)
  const navigate = useNavigate()

  // sem interação na tela do Plinko, volta para o vídeo
  useEffect(() => {
    if (!showIntro) return
    const timer = setTimeout(() => setShowIntro(false), 60000)
    return () => clearTimeout(timer)
  }, [showIntro])

  if (!showIntro) {
    return (
      <div className="w-full h-screen overflow-hidden bg-black" onClick={() => setShowIntro(true)}>
        <video
          src={VideoInicio}
          className="w-full h-screen object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
    )
  }

  return (
    <div className="relative flex flex-col w-full min-h-screen bg-[#045291] text-white items-center justify-center overflow-hidden">
      <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[900px] h-[800px] rounded-full bg-[#0aa3e0]/40 blur-[160px]" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/10 blur-[140px]" />

      <div className="relative z-10 flex flex-col items-center gap-10 text-center px-10 animate-fade-in-up">
        <img
          src={LogoHospitalar}
          alt="Logo Hospitalar"
          className="w-120 object-contain drop-shadow-[0_0_25px_rgba(127,211,247,0.6)]"
        />
        <div className="space-y-4">
          <h1 className="text-8xl font-black tracking-tight">Plinko</h1>
          <p className="text-4xl font-bold">
            <span className="text-[#7fd3f7] font-black">SOLTE A BOLA</span>
            {' '}e ganhe um{' '}
            <span className="text-[#7fd3f7] font-black">PRÊMIO</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/instagram')}
          className="mt-4 flex items-center justify-center w-40 h-40 rounded-full bg-white shadow-[0_0_60px_rgba(127,211,247,0.8)] active:scale-90 transition-all animate-pulse"
        >
          <Play size={70} color="#045291" fill="#045291" className="ml-3" />
        </button>
      </div>

      <AdminGear />

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
      `}</style>
    </div>
  )
}
