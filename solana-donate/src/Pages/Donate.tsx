import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { useCallback, useEffect, useState } from "react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import "@solana/wallet-adapter-react-ui/styles.css";

export const Donate = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>("");

  const donateHandler = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;
    if (isNaN(lamports) || lamports <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey("2ZZafvbKXpG6f4Q4HBebeFtbPSLJLEt9dN1e6aQor2VP"),
        lamports,
      })
    );

    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    const signature = await sendTransaction(transaction, connection, {
      minContextSlot,
    });

    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    });

    alert("Donation successful!");
  }, [publicKey, sendTransaction, connection, amount]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
      }
    };
    fetchBalance();
  }, [publicKey, connection]);

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl  text-center mb-6">Donate Solana </h1>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <WalletMultiButton />
        <WalletDisconnectButton />
      </div>

      {publicKey && (
        <div className="text-lg mb-4 text-center">
          Balance: {balance !== null ? `${balance} SOL` : "Loading..."}
        </div>
      )}

      <div className="w-full max-w-md flex flex-col items-center">
        <input
          className="w-full rounded-xl p-3 border border-gray-700 mb-4"
          type="number"
          step="0.001"
          placeholder="Enter amount in SOL"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          onClick={donateHandler}
          className=" p-3 m-3 bg-violet-700 hover:bg-violet-800 text-white font-semibold py-3 rounded-xl transition"
        >
          Donate
        </button>
      </div>

      <p className="mt-6 text-center text-sm opacity-75">
        ❤️ Your SOL can spark real change.
      </p>
    </div>
  );
};
