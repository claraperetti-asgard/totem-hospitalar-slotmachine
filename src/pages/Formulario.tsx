import { useState, useRef } from "react";
import { useNavigate, NavLink } from 'react-router-dom';
import LogoHospitalar from '../assets/logo-hospitalar.png';
import { ArrowLeft, X, Eye, EyeOff } from 'lucide-react';
import { PatternFormat } from 'react-number-format';
import KeyboardReact from 'react-simple-keyboard';
import "react-simple-keyboard/build/css/index.css";
import { apiUrl } from '../api';
import AcessoAdmin from '../components/layout/AcessoAdmin';
import {
    ADMIN_PASSWORD,
    ADMIN_USER,
    loadGameSettings,
    saveGameSettings,
    type GameSettings,
} from '../config/gameSettings';

const Keyboard = (KeyboardReact as any).default || KeyboardReact;

export default function Formulario() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [cpf, setCpf] = useState("");
    const [inputName, setInputName] = useState<string>("name");
    const [layoutName, setLayoutName] = useState('default');
    const [cpfError, setCpfError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const keyboardRef = useRef<any>(null);

    // acesso admin (mesmo login e painel usados na tela do slot machine)
    const [settings, setSettings] = useState<GameSettings>(() => loadGameSettings());
    const [adminOpen, setAdminOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [loginUser, setLoginUser] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loginField, setLoginField] = useState<"user" | "password">("user");
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [loginLayout, setLoginLayout] = useState('default');
    const loginKeyboardRef = useRef<any>(null);

    const openLogin = () => {
        setLoginUser("");
        setLoginPassword("");
        setLoginError("");
        setLoginField("user");
        setShowLoginPassword(false);
        setLoginLayout('default');
        loginKeyboardRef.current?.setInput("");
        setLoginOpen(true);
    };

    const handleLoginFocus = (field: "user" | "password") => {
        setLoginField(field);
        loginKeyboardRef.current?.setInput(field === "user" ? loginUser : loginPassword);
    };

    const onLoginKeyboardChange = (value: string) => {
        setLoginError("");
        if (loginField === "user") {
            setLoginUser(value);
        } else {
            setLoginPassword(value);
        }
    };

    const onLoginKeyPress = (button: string) => {
        if (button === "{shift}" || button === "{lock}") {
            setLoginLayout(loginLayout === "default" ? "shift" : "default");
        }
    };

    const handleLogin = () => {
        if (
            loginUser.trim().toLowerCase() === ADMIN_USER &&
            loginPassword === ADMIN_PASSWORD
        ) {
            setLoginOpen(false);
            setAdminOpen(true);
            return;
        }

        setLoginError("Usuário ou senha inválidos");
    };

    const handleSaveSettings = (next: GameSettings) => {
        setSettings(saveGameSettings(next));
    };

    const validateCPF = (value: string) => {
        const cpf = value.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

        let sum = 0;
        for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
        let check = (sum * 10) % 11;
        if (check === 10) check = 0;
        if (check !== parseInt(cpf.charAt(9))) return false;

        sum = 0;
        for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
        check = (sum * 10) % 11;
        if (check === 10) check = 0;
        if (check !== parseInt(cpf.charAt(10))) return false;

        return true;
    };

    const isFormValid = (name.trim() !== '' && cpf !== '' && validateCPF(cpf));

    const handleFocus = (field: string, value: string) => {
        setInputName(field);
        setLayoutName(field === "cpf" ? "numeric" : "default");
        if (keyboardRef.current) {
            keyboardRef.current.setInput(value);
        }
    };

    const onKeyboardChange = (inputVal: string) => {
        if (inputName === "name") setName(inputVal);

        if (inputName === "cpf") {
            const digits = inputVal.replace(/\D/g, '').slice(0, 11);
            setCpf(digits);
            setSubmitError("");

            if (digits === "" || validateCPF(digits)) {
                setCpfError("");
            } else if (digits.length === 11) {
                setCpfError("CPF inválido");
            } else {
                setCpfError("");
            }
        }
    };

    const handleShift = () => {
        setLayoutName(layoutName === "default" ? "shift" : "default");
    };

    const onKeyPress = (button: string) => {
        if (button === "{shift}" || button === "{lock}") {
            handleShift();
        }
    };

    async function createLead() {
        if (!validateCPF(cpf)) {
            setCpfError("CPF inválido");
            return;
        }

        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);
        setSubmitError("");

        try {
            const response = await fetch(apiUrl('/leads'), {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    cpf: cpf
                })
            });

            if (response.ok) {
                navigate('/slot-machine');
                return;
            }

            if (response.status === 409) {
                setSubmitError("Este CPF já participou da promoção.");
            } else {
                setSubmitError("Não foi possível concluir o cadastro. Tente novamente.");
            }
        } catch (error) {
            console.error(error);
            setSubmitError("Erro de conexão. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="relative flex flex-col items-center justify-start min-h-screen gap-10 pb-32 pt-10 w-full mt-5 bg-white p-6">
            <div className='flex justify-between items-center w-full max-w-6xl z-20'>
                <NavLink to={'/'} className="p-4 bg-white rounded-full shadow-md">
                    <ArrowLeft size={60} color='#0262b0' />
                </NavLink>
                <img src={LogoHospitalar} className="h-32 w-auto object-contain" alt="Logo" />
            </div>

            <div className="bg-[#003e82]/20 p-8 rounded-[40px] shadow-2xl mt-15 w-full max-w-4xl flex flex-col h-auto py-20 gap-7">
                <h2 className="text-5xl font-extrabold text-gray-800 text-center mb-4">Preencha o formulário</h2>

                <div className="flex flex-col gap-3">
                    <label className="text-3xl font-bold text-gray-600 ml-2">Nome Completo</label>
                    <input
                        id="name"
                        type="text"
                        readOnly
                        value={name}
                        onFocus={() => handleFocus("name", name)}
                        placeholder="Digite seu nome"
                        className={`w-full h-24 px-8 text-4xl rounded-2xl bg-gray-50 border-4 transition-all outline-none ${inputName === 'name' ? 'border-black' : 'border-white'}`}
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label className="text-3xl font-bold text-gray-600 ml-2">CPF</label>
                    <PatternFormat
                        id="cpf"
                        format="###.###.###-##"
                        mask="_"
                        value={cpf}
                        readOnly
                        onFocus={() => handleFocus("cpf", cpf)}
                        placeholder="000.000.000-00"
                        className={`w-full h-24 px-8 text-4xl rounded-2xl bg-gray-50 border-4 transition-all outline-none ${inputName === 'cpf' ? 'border-black' : (cpfError ? 'border-red-500' : 'border-white')}`}
                    />
                    {cpfError && <span className="text-2xl text-red-500 font-semibold ml-2">{cpfError}</span>}
                </div>

                <div className="mt-4 p-4 bg-white/50 rounded-3xl shadow-inner text-black relative z-50">
                    <Keyboard
                        keyboardRef={(r: any) => (keyboardRef.current = r)}
                        layoutName={layoutName}
                        onChange={onKeyboardChange}
                        onKeyPress={onKeyPress}
                        disableCaretPositioning={true}
                        theme={`hg-theme-default totem-kb ${layoutName === 'numeric' ? 'totem-kb-numeric' : ''}`}
                        layout={{
                            default: [
                                "1 2 3 4 5 6 7 8 9 0",
                                "q w e r t y u i o p á é í",
                                "a s d f g h j k l ó ú ç",
                                "{shift} z x c v b n m ã {backspace}",
                                ". _ - + * {space}"
                            ],
                            numeric: [
                                "1 2 3",
                                "4 5 6",
                                "7 8 9",
                                "0 {backspace}"
                            ],
                            shift: [
                                "! # $ % ¨ & * ( ) ?",
                                "Q W E R T Y U I O P Á É Í",
                                "A S D F G H J K L Ó Ú Ç",
                                "{shift} Z X C V B N M Ã {backspace}",
                                ". _ - + ? ^ ~ {space}"
                            ]
                        }}
                        display={{
                            "{backspace}": "⌫ Apagar",
                            "{shift}": "⇧",
                            "{space}": "Espaço",
                        }}
                    />
                </div>

                {submitError && (
                    <span className="text-center text-2xl text-red-500 font-semibold mt-2">{submitError}</span>
                )}

                <button
                    type="button"
                    onClick={createLead}
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full text-center bg-black text-white font-bold text-4xl py-10 rounded-2xl shadow-lg mt-16 uppercase transition-all ${(!isFormValid || isSubmitting) ? 'opacity-70' : ''}`}
                >
                    {isSubmitting
                        ? 'Enviando...'
                        : (cpf !== "" && !validateCPF(cpf))
                            ? 'CPF Inválido'
                            : isFormValid
                                ? 'Confirmar Cadastro'
                                : 'Preencha os dados'}
                </button>
            </div>

            <button
                type="button"
                onClick={openLogin}
                className="absolute bottom-10 right-10 px-8 py-3 bg-white  text-black text-xl font-bold rounded-full shadow-2xl"
            >
                Acesso Admin
            </button>

            {/* ---------- MODAL DE LOGIN ---------- */}
            {loginOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-8">
                    <div className="relative w-full max-w-2xl rounded-3xl bg-[#045291] text-white border border-white/20 p-10 space-y-8 shadow-[0_30px_70px_rgba(0,0,0,0.5)]">
                        <button
                            type="button"
                            onClick={() => setLoginOpen(false)}
                            className="absolute right-6 top-6 bg-white/10 border border-white/20 p-2 rounded-full"
                        >
                            <X color="#ffffff" size={28} />
                        </button>

                        <h2 className="text-4xl font-black">Acesso Admin</h2>

                        <div className="space-y-3">
                            <label className="block text-2xl font-bold">Usuário</label>
                            <input
                                value={loginUser}
                                readOnly
                                onFocus={() => handleLoginFocus("user")}
                                onClick={() => handleLoginFocus("user")}
                                className={`w-full bg-white text-[#045291] text-3xl font-bold rounded-2xl px-6 py-4 outline-none border-4 transition-all ${loginField === 'user' ? 'border-[#003e82]' : 'border-transparent'}`}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-2xl font-bold">Senha</label>
                            <div className="relative">
                                <input
                                    type={showLoginPassword ? "text" : "password"}
                                    value={loginPassword}
                                    readOnly
                                    onFocus={() => handleLoginFocus("password")}
                                    onClick={() => handleLoginFocus("password")}
                                    className={`w-full bg-white text-[#045291] text-3xl font-bold rounded-2xl pl-6 pr-20 py-4 outline-none border-4 transition-all ${loginField === 'password' ? 'border-[#003e82]' : 'border-transparent'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                    aria-label={showLoginPassword ? "Ocultar senha" : "Mostrar senha"}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full"
                                >
                                    {showLoginPassword
                                        ? <EyeOff color="#045291" size={32} />
                                        : <Eye color="#045291" size={32} />}
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-white/10 rounded-2xl">
                            <Keyboard
                                keyboardRef={(r: any) => (loginKeyboardRef.current = r)}
                                baseClass="admin-keyboard"
                                layoutName={loginLayout}
                                onChange={onLoginKeyboardChange}
                                onKeyPress={onLoginKeyPress}
                                disableCaretPositioning={true}
                                theme="hg-theme-default totem-kb totem-kb-mini"
                                layout={{
                                    default: [
                                        "1 2 3 4 5 6 7 8 9 0",
                                        "q w e r t y u i o p",
                                        "a s d f g h j k l ç",
                                        "{shift} z x c v b n m @ . {backspace}"
                                    ],
                                    shift: [
                                        "1 2 3 4 5 6 7 8 9 0",
                                        "Q W E R T Y U I O P",
                                        "A S D F G H J K L Ç",
                                        "{shift} Z X C V B N M @ . {backspace}"
                                    ]
                                }}
                                display={{
                                    "{backspace}": "⌫",
                                    "{shift}": "⇧",
                                }}
                            />
                        </div>

                        {loginError && (
                            <p className="text-red-300 text-xl font-bold">{loginError}</p>
                        )}

                        <button
                            type="button"
                            onClick={handleLogin}
                            className="w-full px-12 py-4 bg-white text-[#045291] text-3xl font-black rounded-full"
                        >
                            Entrar
                        </button>
                    </div>
                </div>
            )}

            {/* ---------- PAINEL ADMIN ---------- */}
            {adminOpen && (
                <AcessoAdmin
                    settings={settings}
                    onSave={handleSaveSettings}
                    onClose={() => setAdminOpen(false)}
                />
            )}
        </div>
    );
}
