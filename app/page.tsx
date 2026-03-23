'use client';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, Connection } from '@solana/web3.js';
import { useState } from 'react';
import { Buffer } from 'buffer';

// Простые и безопасные иконки
const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const TelegramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black font-mono overflow-hidden">
      
      {/* Безопасный фон */}
      <div className="absolute inset-0 bg-black z-0"></div>

      {/* Верхние кнопки (Ссылки) */}
      <div className="absolute top-6 right-6 flex gap-4 z-10">
        <a href="https://x.com/schmawo" target="_blank" rel="noopener noreferrer" 
           className="flex items-center gap-2 px-5 py-3 bg-black border border-neutral-800 text-neutral-500 hover:text-cyan-400 hover:border-cyan-400 transition-colors font-mono text-xs uppercase tracking-widest">
          <TwitterIcon />
          <span>X/TWITTER</span>
        </a>
        <a href="https://t.me/jumpstylegods" target="_blank" rel="noopener noreferrer" 
           className="flex items-center gap-2 px-5 py-3 bg-black border border-neutral-800 text-neutral-500 hover:text-purple-400 hover:border-purple-400 transition-colors font-mono text-xs uppercase tracking-widest">
          <TelegramIcon />
          <span>TELEGRAM</span>
        </a>
      </div>

      {/* Центральный блок */}
      <div className="flex flex-col items-center justify-center text-center max-w-2xl px-4 z-10 mt-12 mb-20">
        
        {/* Текстовый ЛОГОТИП */}
        <div className="mb-12 relative">
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-md">
            JUMP<span className="text-cyan-400 drop-shadow-lg">STYLE</span>
          </h1>
          <div className="text-cyan-500 font-bold tracking-[0.3em] mt-4 text-sm md:text-lg">PROTOCOL // V1.0</div>
        </div>

        <p className="text-sm md:text-lg text-neutral-600 font-mono mb-16 tracking-widest">[ INITIATE PAYMENT TO ACTIVATE CYCLE_0 ]</p>
        
        {/* Кнопка кошелька */}
        <div className="custom-wallet-button mb-16 border border-neutral-800 hover:border-cyan-500 transition-colors">
          <WalletMultiButton />
        </div>

        {/* Блок оплаты */}
        {publicKey && (
          <div className="p-8 md:p-12 border border-neutral-800 bg-neutral-900/30 w-full max-w-xl transition-colors hover:border-cyan-500">
            <div className="flex justify-between items-center mb-10 border-b border-neutral-800 pb-4">
              <span className="text-neutral-500 text-xs md:text-sm tracking-widest uppercase">Execution Fee</span>
              <span className="text-white font-bold text-lg md:text-xl tracking-wider">0.1 SOL</span>
            </div>

            <button 
              onClick={handleAction} 
              disabled={loading} 
              className="w-full py-6 bg-black border border-cyan-900 text-cyan-500 font-bold font-mono text-sm md:text-lg uppercase hover:bg-cyan-950 hover:text-white transition-colors disabled:opacity-30 disabled:border-neutral-800 tracking-widest"
            >
              {loading ? ">>> PROCESS_INITIALIZING..." : ">>> EXECUTE CYCLE"}
            </button>
            
            {result !== null && (
              <div className="mt-12 pt-8 text-center border-t border-neutral-800">
                <p className="text-cyan-600 uppercase text-xs mb-4 tracking-[0.3em]">RESPONSE_CODE:</p>
                <div className="text-7xl font-black text-white tracking-tighter drop-shadow-xl">
                  {result}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Футер */}
      <div className="absolute bottom-6 text-[10px] text-neutral-700 tracking-widest uppercase z-10 flex gap-4 opacity-50">
        <span>jumpstyle-terminal</span>
        <span className="text-neutral-800">///</span>
        <span>authorized access only</span>
      </div>
    </main>
  );
}
