'use client';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, Connection, PublicKey } from '@solana/web3.js';
import { useState } from 'react';

export default function Home() {
  const { publicKey, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const handlePlay = async () => {
    if (!publicKey || !signTransaction) return alert("Подключи кошелек!");
    setLoading(true);
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        body: JSON.stringify({ userWallet: publicKey.toBase58() }),
      });
      const { transaction, invoice } = await res.json();

      const connection = new Connection("https://rpc.solanatracker.io/public");
      const tx = Transaction.from(Buffer.from(transaction, 'base64'));
      const signedTx = await signTransaction(tx);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      
      await connection.confirmTransaction(signature, 'confirmed');

      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        body: JSON.stringify({ signature, invoice, userWallet: publicKey.toBase58() }),
      });
      const data = await verifyRes.json();

      if (data.success) setResult(data.number);
      else alert("Ошибка проверки платежа");
    } catch (e) {
      console.error(e);
      alert("Ошибка транзакции");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-6xl font-black text-yellow-400 mb-2 italic">JUMPSTYLE</h1>
      <p className="text-zinc-500 mb-8 uppercase tracking-widest">Random Number Generator</p>
      
      <div className="mb-8">
        <WalletMultiButton />
      </div>

      {publicKey && (
        <div className="p-10 border-2 border-yellow-400/20 rounded-[40px] bg-zinc-900/50 backdrop-blur-md">
          <p className="text-zinc-400 mb-6">Цена попытки: <span className="text-white font-bold">0.1 SOL</span></p>
          <button 
            onClick={handlePlay}
            disabled={loading}
            className="px-12 py-5 bg-yellow-400 text-black font-black rounded-full hover:scale-110 active:scale-95 transition-all disabled:bg-zinc-700"
          >
            {loading ? "МАГИЯ В ПРОЦЕССЕ..." : "ОПЛАТИТЬ И КРУТИТЬ"}
          </button>

          {result !== null && (
            <div className="mt-10 animate-in fade-in zoom-in duration-500">
              <p className="text-zinc-500 text-sm mb-1 uppercase">Твое число:</p>
              <p className="text-8xl font-mono font-bold text-yellow-400 tracking-tighter">{result}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
