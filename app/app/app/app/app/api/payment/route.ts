import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { PumpAgent } from "@pump-fun/agent-payments-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userWallet } = await req.json();
  const connection = new Connection(process.env.SOLANA_RPC_URL!);
  const agent = new PumpAgent(new PublicKey(process.env.AGENT_TOKEN_MINT_ADDRESS!), "mainnet", connection);
  const now = Math.floor(Date.now() / 1000);
  const memo = Math.floor(Math.random() * 900000) + 100000;
  
  const ixs = await agent.buildAcceptPaymentInstructions({
    user: new PublicKey(userWallet),
    currencyMint: new PublicKey("So11111111111111111111111111111111111111112"),
    amount: 100000000,
    memo,
    startTime: now,
    endTime: now + 3600,
  });

  const { blockhash } = await connection.getLatestBlockhash();
  const tx = new Transaction().add(...ixs);
  tx.recentBlockhash = blockhash;
  tx.feePayer = new PublicKey(userWallet);

  return NextResponse.json({ 
    transaction: tx.serialize({ requireAllSignatures: false }).toString("base64"),
    invoice: { amount: 100000000, memo, startTime: now, endTime: now + 3600 }
  });
}
