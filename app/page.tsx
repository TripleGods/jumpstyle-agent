'use client';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, Connection } from '@solana/web3.js';
import { useState } from 'react';
import { Buffer } from 'buffer';

// Процедурный JUMPSTYLE танцор (SVG + сложная CSS анимация кик-степа)
const JumpstyleDancer = () => (
  <svg width="70" height="90" viewBox="0 0 100 130" className="opacity-40">
    <style>{`
      @keyframes jumpstyle-body {
        0%, 100% { transform: translateY(0); }
        25%, 75% { transform: translateY(-3px); }
        50% { transform: translateY(-5px); }
      }
      @keyframes jumpstyle-leg-left {
        0%, 100% { transform: rotate(0deg) translate(0,0); }
        12.5% { transform: rotate(-30deg) translate(2px,-5px); }
        25% { transform: rotate(40deg) translate(-5px,10px); }
        37.5% { transform: rotate(-10deg) translate(0,0); }
        50% { transform: rotate(0deg) translate(0,0); }
        62.5% { transform: rotate(10deg) translate(0,2px); }
        75% { transform: rotate(-20deg) translate(5px,-5px); }
        87.5% { transform: rotate(0deg) translate(0,0); }
      }
      @keyframes jumpstyle-leg-right {
        0%, 100% { transform: rotate(0deg) translate(0,0); }
        12.5% { transform: rotate(10deg) translate(0,2px); }
        25% { transform: rotate(-20deg) translate(5px,-5px); }
        37.5% { transform: rotate(0deg) translate(0,0); }
        50% { transform: rotate(0deg) translate(0,0); }
        62.5% { transform: rotate(30deg) translate(-2px,-5px); }
        75% { transform: rotate(-40deg) translate(5px,10px); }
        87.5% { transform: rotate(10deg) translate(0,0); }
      }
      @keyframes jumpstyle-arms {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-2px) rotate(10deg); }
        50% { transform: translateY(0) rotate(0deg); }
        75% { transform: translateY(-2px) rotate(-10deg); }
      }
      .dancer { animation: jumpstyle-body 0.4s infinite ease-out; transform-origin: center bottom; }
      .limb { stroke-width: 4; stroke: white; stroke-linecap: round; transform-origin: 50px 70px; }
      .leg-l { animation: jumpstyle-leg-left 0.8s infinite linear; }
      .leg-r { animation: jumpstyle-leg-right 0.8s infinite linear; }
      .arm { animation: jumpstyle-arms 0.4s infinite ease-out; }
    `}</style>
    <g className="dancer">
      {/* Голова */}
      <circle cx="50" cy="30" r="10" fill="white" />
      {/* Тело */}
      <line x1="50" y1="40" x2="50" y2="70" stroke="white" strokeWidth="5" strokeLinecap="round" />
      {/* Руки */}
      <line x1="50" y1="50" x2="20" y2="55" className="limb arm" />
      <line x1="50" y1="50" x2="80" y2="55" className="limb arm" />
      {/* Ноги */}
      <line x1="50" y1="70" x2="35" y2="110" className="limb leg-l" />
      <line x1="50" y1="70" x2="65" y2="110" className="limb leg-r" />
    </g>
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
      });
      const data = await verifyRes.json();
      if (data.success) setResult(data.number);
      else alert(`Ошибка верификации: ${data.error}`);
    } catch (e: any) { 
      console.error(e);
      alert(`Ошибка: ${e.message || "Транзакция отклонена или недостаточно средств."}`); 
    } finally { setLoading(false); }
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-neutral-500 p-4 font-mono">
      {/* Ссылки (Верхний правый угол, тотальный минимализм) */}
      <div className="absolute top-4 right-4 flex gap-6 text-[11px] opacity-40 hover:opacity-100 transition-opacity">
        <a href="https://twitter.com/твой_твиттер" target="_blank" rel="noopener noreferrer" className="hover:text-white">X/TWITTER</a>
        <a href="https://t.me/твой_телеграм" target="_blank" rel="noopener noreferrer" className="hover:text-white">TG/TELEGRAM</a>
      </div>

      {/* Танцующий JUMPSTYLE человечек (Нижний левый угол) */}
      <div className="absolute bottom-6 left-6">
        <JumpstyleDancer />
      </div>

      {/* Заголовок (Строгий, хакерский стиль терминала) */}
      <h1 className="text-2xl font-light tracking-widest text-neutral-700 mb-16 uppercase">
        JUMPSTYLE.<span className="opacity-40">terminal_v1.0</span>
      </h1>
      
      {/* Стилизация кнопки кошелька под тотально черный стиль */}
      <div className="custom-wallet-button opacity-70 hover:opacity-100 scale-90">
        <WalletMultiButton />
      </div>

      {publicKey && (
        <div className="mt-20 p-8 border border-neutral-900 rounded-none bg-black w-full max-w-sm">
          <p className="mb-6 text-neutral-700 text-[13px] tracking-tight">STATUS: ACTIVE // REQ: 0.1 SOL</p>
          <button 
            onClick={handleAction} 
            disabled={loading} 
            className="w-full py-4 bg-black border border-neutral-800 text-white font-mono text-[14px] hover:bg-neutral-950 transition-colors disabled:opacity-20 disabled:border-neutral-900"
          >
            {loading ? ">>> INITIALIZING PAYMENT..." : ">>> EXECUTE JUMPSTYLE CYCLE"}
          </button>
          
          {result !== null && (
            <div className="mt-12 border-t border-neutral-900 pt-6">
              <p className="text-neutral-800 uppercase text-[11px] mb-2">RESPONSE CODE:</p>
              <div className="text-7xl font-black text-white tracking-tighter animate-pulse">{result}</div>
            </div>
          )}
        </div>
      )}
      
      {/* Футер (Совсем осторожный) */}
      <div className="absolute bottom-4 right-4 text-[10px] text-neutral-800 tracking-tight">
        restricted access // unauth usage prohibited
      </div>
    </main>
  );
}
