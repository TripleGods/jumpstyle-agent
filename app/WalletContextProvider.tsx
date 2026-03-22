'use client';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';

export const WalletContextProvider = ({ children }: { children: React.ReactNode }) => {
  const endpoint = "https://rpc.solanatracker.io/public";
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  // Говорим строгому TypeScript "пропустить проверку" для этих компонентов
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
