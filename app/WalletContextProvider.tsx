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
  
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new TrustWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new LedgerWalletAdapter(),
  ], []);

  const ConnectionNode = ConnectionProvider as any;
  const WalletNode = WalletProvider as any;
  const ModalNode = WalletModalProvider as any;

  return (
    <ConnectionNode endpoint={endpoint}>
      {/* Убрали autoConnect вот отсюда: */}
      <WalletNode wallets={wallets}>
        <ModalNode>{children}</ModalNode>
      </WalletNode>
    </ConnectionNode>
  );
};
