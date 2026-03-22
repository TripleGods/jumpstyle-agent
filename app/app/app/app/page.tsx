'use client';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, Connection } from '@solana/web3.js';
import { useState } from 'react';

export default function Home() {
  const { publicKey, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const handleAction = async () => {
    if (!publicKey || !signTransaction) return alert("Подключи кошелек!");
    setLoading(true);
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        body: JSON.stringify({ userWallet: publicKey.toBase58() }),
      });
      const { transaction, invoice } = await res.json();
      const connection = new Connection("https://rpc.solanatracker.io/public", "confirmed");
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
    } catch (e) { alert("Ошибка транзакции"); }
    finally { setLoading(false); }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h1 className="text-7xl font-black text-yellow-400 italic mb-4 uppercase">JUMPSTYLE</h1>
      <WalletMultiButton />
      {publicKey && (
        <div className="mt-10 p-8 border-2 border-yellow-400/20 rounded-3xl bg-zinc-900">
          <p className="mb-6 text-zinc-400">Стоимость: 0.1 SOL</p>
          <button onClick={handleAction} disabled={loading} className="px-10 py-4 bg-yellow-400 text-black font-bold rounded-full">
            {loading ? "КРУТИМ..." : "ОПЛАТИТЬ И КРУТИТЬ"}
          </button>
          {result !== null && <div className="mt-8 text-6xl font-mono text-yellow-400">{result}</div>}
        </div>
      )}
    </main>
  );
}
