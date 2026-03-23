'use client';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
  CoinbaseWalletAdapter,
  LedgerWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';

export const WalletContextProvider = ({ children }: { children: React.ReactNode }) => {
  const endpoint = "https://rpc.solanatracker.io/public";
  
  // Здесь мы загружаем список самых популярных адаптеров.
  // Остальные десятки кошельков Solana подтянет автоматически, если они установлены у человека.
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new TrustWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new LedgerWalletAdapter(),
  ], []);

  // Говорим строгому TypeScript "пропустить проверку" для этих компонентов (наш старый хак)
  const ConnectionNode = ConnectionProvider as any;
  const WalletNode = WalletProvider as any;
  const ModalNode = WalletModalProvider as any;

  return (
    <ConnectionNode endpoint={endpoint}>
      <WalletNode wallets={wallets} autoConnect>
        <ModalNode>{children}</ModalNode>
      </WalletNode>
    </ConnectionNode>
  );
};
