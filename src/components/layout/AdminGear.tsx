import { useRef, useState } from "react";
import { X, Eye, EyeOff, Settings } from 'lucide-react';
import KeyboardReact from 'react-simple-keyboard';
import "react-simple-keyboard/build/css/index.css";
import AcessoAdmin from './AcessoAdmin';
import {
    ADMIN_PASSWORD,
    ADMIN_USER,
    loadGameSettings,
    saveGameSettings,
    type GameSettings,
} from '../../config/gameSettings';

const Keyboard = (KeyboardReact as any).default || KeyboardReact;

// Engrenagem discreta que abre o login e o painel do administrador
export default function AdminGear() {
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

    return (
        <>
            <button
                type="button"
                onClick={openLogin}
                aria-label="Acesso Admin"
                className="absolute bottom-6 right-6 z-20 p-3 bg-white border border-black rounded-full"
            >
                <Settings size={28} color="#000000" strokeWidth={1.75} />
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
        </>
    );
}
