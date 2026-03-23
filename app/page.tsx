'use client';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, Connection } from '@solana/web3.js';
import { useState } from 'react';
import { Buffer } from 'buffer';
import Image from 'next/image';

// Процедурный JUMPSTYLE танцор (SVG + сложная CSS анимация кик-степа)
// Сделан чуть более заметным
const JumpstyleDancer = () => (
  <svg width="80" height="100" viewBox="0 0 100 130" className="opacity-60">
    <style>{`
      @keyframes jumpstyle-body {
        0%, 100% { transform: translateY(0); }
        25%, 75% { transform: translateY(-4px); }
        50% { transform: translateY(-7px); }
      }
      @keyframes jumpstyle-leg-left {
        0%, 100% { transform: rotate(0deg) translate(0,0); }
        12.5% { transform: rotate(-35deg) translate(2px,-6px); }
        25% { transform: rotate(45deg) translate(-6px,12px); }
        37.5% { transform: rotate(-15deg) translate(0,0); }
        50% { transform: rotate(0deg) translate(0,0); }
        62.5% { transform: rotate(15deg) translate(0,2px); }
        75% { transform: rotate(-25deg) translate(6px,-6px); }
        87.5% { transform: rotate(0deg) translate(0,0); }
      }
      @keyframes jumpstyle-leg-right {
        0%, 100% { transform: rotate(0deg) translate(0,0); }
        12.5% { transform: rotate(15deg) translate(0,2px); }
        25% { transform: rotate(-25deg) translate(6px,-6px); }
        37.5% { transform: rotate(0deg) translate(0,0); }
        50% { transform: rotate(0deg) translate(0,0); }
        62.5% { transform: rotate(35deg) translate(-2px,-6px); }
        75% { transform: rotate(-45deg) translate(6px,12px); }
        87.5% { transform: rotate(15deg) translate(0,0); }
      }
      @keyframes jumpstyle-arms {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-3px) rotate(12deg); }
        50% { transform: translateY(0) rotate(0deg); }
        75% { transform: translateY(-3px) rotate(-12deg); }
      }
      .dancer { animation: jumpstyle-body 0.38s infinite ease-out; transform-origin: center bottom; }
      .limb { stroke-width: 4.5; stroke: white; stroke-linecap: round; transform-origin: 50px 70px; }
      .leg-l { animation: jumpstyle-leg-left 0.76s infinite linear; }
      .leg-r { animation: jumpstyle-leg-right 0.76s infinite linear; }
      .arm { animation: jumpstyle-arms 0.38s infinite ease-out; }
    `}</style>
    <g className="dancer">
      <circle cx="50" cy="30" r="11" fill="white" />
      <line x1="50" y1="41" x2="50" y2="70" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <line x1="50" y1="50" x2="18" y2="55" className="limb arm" />
      <line x1="50" y1="50" x2="82" y2="55" className="limb arm" />
      <line x1="50" y1="70" x2="33" y2="110" className="limb leg-l" />
      <line x1="50" y1="70" x2="67" y2="110" className="limb leg-r" />
    </g>
  </svg>
);

// Минималистичные иконки для кнопок соцсетей
const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const TelegramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />
  </svg>
);

export default function Home() {
  const { publicKey, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const handleAction = async () => {
    if (!publicKey || !signTransaction) return alert("Подключи кошелек!");
    setLoading(true);
    try {
      const connection = new Connection("https://rpc.solanatracker.io/public", "confirmed");
      const invoiceRes = await fetch('/api/invoice', { method: 'POST' });
      const { invoice } = await invoiceRes.json();
      const res = await fetch('/api/payment', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userWallet: publicKey.toBase58(), invoice }) 
      });
      const { transaction } = await res.json();
      if (!transaction) throw new Error("Транзакция не создана сервером");
      const tx = Transaction.from(Buffer.from(transaction, 'base64'));
      const signedTx = await signTransaction(tx);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      if (confirmation.value.err) throw new Error("Транзакция не подтверждена сетью");
      const verifyRes = await fetch('/api/verify', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature, invoice, userWallet: publicKey.toBase58() }) 
= await verifyRes.json();
      if (data.success) setResult(data.number);
      else alert(`Ошибка верификации: ${data.error}`);
    } catch (e: any) { 
      console.error(e);
      alert(`Ошибка: ${e.message || "Транзакция отклонена или недостаточно средств."}`); 
    } finally { setLoading(false); }
  };

  return (
    // ФОНОВЫЙ КАРТИНКА НА ВЕСЬ ЭКРАН (Референс к `imgbin...jpg`)
    // Я задал overlay (bg-black/85), чтобы текст был читаем
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-[url('/imgbin-hardstyle-logo-symbol-disc-jockey-remix-symbol-VQRru2VzYmgya56PUfuMPDtZ4_t.jpg')] bg-cover bg-center bg-no-repeat font-mono">
      {/* Полупрозрачный темный оверлей для читаемости */}
      <div className="absolute inset-0 bg-black/85 z-0"></div>

      {/* Верхние "красивые кнопки" (Ссылки) */}
      <div className="absolute top-6 right-6 flex gap-4 z-10">
        {/* Кнопка Twitter */}
        <a href="https://x.com/schmawo" target="_blank" rel="noopener noreferrer" 
           className="flex items-center gap-2.5 px-6 py-3.5 bg-neutral-900 border border-neutral-700 hover:border-white text-white font-mono text-sm uppercase tracking-wider transition-all hover:bg-black group hover:shadow-[0_0_15px_1px_rgba(30,144,255,0.4)]">
          <TwitterIcon />
          <span>X/TWITTER</span>
        </a>
        {/* Кнопка Telegram */}
        <a href="https://t.me/jumpstylegods" target="_blank" rel="noopener noreferrer" 
           className="flex items-center gap-2.5 px-6 py-3.5 bg-neutral-900 border border-neutral-700 hover:border-white text-white font-mono text-sm uppercase tracking-wider transition-all hover:bg-black group hover:shadow-[0_0_15px_1px_rgba(138,43,226,0.4)]">
          <TelegramIcon />
          <span>TELEGRAM</span>
        </a>
      </div>

      {/* Процедурный JUMPSTYLE танцор (Нижний левый угол) */}
      <div className="absolute bottom-6 left-6 z-10">
        <JumpstyleDancer />
      </div>

      {/* Центральный блок */}
      <div className="flex flex-col items-center justify-center text-center max-w-2xl px-4 z-10 mt-16 mb-24">
        {/* МАССИВНЫЙ ЦЕНТРАЛЬНЫЙ ЛОГОТИП (Референс к `image_12fc85.png`) */}
        <div className="relative mb-16 opacity-100 hover:scale-105 transition-transform">
          <Image src="/image_12fc85.png" alt="JUMPSTYLE SYMBOL" width={300} height={300} className="w-auto h-auto" />
          {/* Subtle Электрический Синий пульсирующий Glow */}
          <div className="absolute inset-0 rounded-full bg-electric-blue/10 blur-2xl animate-pulse -z-10"></div>
        </div>

        {/* Агрессивный Hardstyle заголовок */}
        <h1 className="text-6xl font-black text-white tracking-tighter mb-4 uppercase leading-none">
          JUMPSTYLE PROTOCOL: <span className="text-electric-blue animate-pulse">REVELATION</span>
        </h1>
        <p className="text-xl text-neutral-400 font-normal mb-20">[ INITIATE PAYMENT TO ACTIVATE CYCLE_0 ]</p>
        
        {/* Кнопка кошелька */}
        <div className="custom-wallet-button scale-100 mb-20 border border-neutral-700 hover:border-white transition-all">
          <WalletMultiButton />
        </div>

        {publicKey && (
          <div className="p-10 border border-neutral-800 rounded-none bg-neutral-900/60 w-full max-w-lg mb-20 group hover:border-electric-blue transition-colors">
            <p className="mb-8 text-white text-[15px] tracking-tight uppercase">EXECUTION FEE: <span className="font-bold text-lg">0.1 SOL</span> for access.</p>
            <button 
              onClick={handleAction} 
              disabled={loading} 
              className="w-full py-5 bg-black border border-neutral-700 text-white font-mono text-[16px] uppercase hover:bg-neutral-950 transition-colors disabled:opacity-20 disabled:border-neutral-800"
            >
              {loading ? ">>> PROCESS_INITIALIZING..." : ">>> EXECUTE JUMPSTYLE CYCLE"}
            </button>
            
            {result !== null && (
              <div className="mt-12 border-t border-neutral-800 pt-8 text-center">
                <p className="text-neutral-500 uppercase text-[12px] mb-3 font-medium">RESPONSE_CYCLE_CODE:</p>
                <div className="text-8xl font-black text-electric-blue tracking-tighter animate-pulse">{result}</div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Ограничивающий футер */}
      <div className="absolute bottom-4 right-4 text-[10px] text-neutral-700 tracking-tight uppercase z-10">
        jumpstyle-terminal // authorized access only // protocol: rev // unrestricted usage prohibited
      </div>
    </main>
  );
}
