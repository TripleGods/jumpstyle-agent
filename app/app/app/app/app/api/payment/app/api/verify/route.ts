import { Connection, PublicKey } from "@solana/web3.js";
import { PumpAgent } from "@pump-fun/agent-payments-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { signature, invoice, userWallet } = await req.json();
  const agent = new PumpAgent(new PublicKey(process.env.AGENT_TOKEN_MINT_ADDRESS!));

  const verified = await agent.validateInvoicePayment({
    user: new PublicKey(userWallet),
    currencyMint: new PublicKey("So11111111111111111111111111111111111111112"),
    amount: Number(invoice.amount),
    memo: Number(invoice.memo),
    startTime: Number(invoice.startTime),
    endTime: Number(invoice.endTime),
  });

  if (verified) return NextResponse.json({ success: true, number: Math.floor(Math.random() * 1001) });
  return NextResponse.json({ success: false }, { status: 400 });
}
