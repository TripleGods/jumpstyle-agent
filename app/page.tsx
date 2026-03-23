'use client';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, Connection } from '@solana/web3.js';
import { useState } from 'react';
import { Buffer } from 'buffer';

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
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
    // Этот блок жестко центрирует ВСЁ на экране по вертикали и горизонтали
    <main className="flex flex-col items-center justify-center w-screen h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* Контейнер для всех элементов, чтобы они шли ровно друг под другом */}
      <div className="flex flex-col items-center justify-center space-y-10">
        
        {/* Заголовок */}
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter text-center m-0">
          JUMPSTYLE
        </h1>

        {/* Контейнер для кнопок соцсетей */}
        <div className="flex flex-row items-center justify-center space-x-6">
          {/* Кнопка Twitter (цвет #512da8 - это оригинальный фиолетовый цвет Phantom) */}
          <a href="https://x.com/schmawo" target="_blank" rel="noopener noreferrer" 
             className="flex flex-row items-center justify-center space-x-2 px-6 py-3 bg-[#512da8] text-white rounded-md font-bold text-base hover:bg-[#311b92] transition-colors"
             style={{ textDecoration: 'none' }}>
            <TwitterIcon /> <span>Twitter</span>
          </a>
          
          {/* Кнопка Telegram */}
          <a href="https://t.me/jumpstylegods" target="_blank" rel="noopener noreferrer" 
             className="flex flex-row items-center justify-center space-x-2 px-6 py-3 bg-[#512da8] text-white rounded-md font-bold text-base hover:bg-[#311b92] transition-colors"
             style={{ textDecoration: 'none' }}>
            <TelegramIcon /> <span>Telegram</span>
          </a>
        </div>

        {/* Кнопка Кошелька */}
        <div className="flex items-center justify-center">
          <WalletMultiButton />
        </div>

        {/* Блок оплаты (центруется вместе со всеми) */}
        {publicKey && (
          <div className="flex flex-col items-center w-full max-w-sm mt-4 p-8 border border-neutral-800 rounded-xl bg-[#111] shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4 w-full">
              <span className="text-neutral-400 font-medium">Стоимость</span>
              <span className="text-white font-bold text-xl">0.1 SOL</span>
            </div>

            {/* Фиолетовая кнопка оплаты */}
            <button 
              onClick={handleAction} 
              disabled={loading} 
              className="w-full py-4 bg-[#512da8] text-white rounded-md font-bold text-lg hover:bg-[#311b92] transition-colors disabled:opacity-50 flex justify-center items-center"
            >
              {loading ? "Обработка..." : "ОПЛАТИТЬ"}
            </button>
            
            {result !== null && (
              <div className="mt-8 pt-8 border-t border-neutral-800 text-center w-full">
                <p className="text-neutral-400 text-sm mb-2">Результат:</p>
                <div className="text-6xl font-black text-white">
                  {result}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
