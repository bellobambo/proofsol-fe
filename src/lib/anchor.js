"use client";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import idl  from './proofidl.json'


const PROGRAM_ID = new PublicKey("CXtj9nH7sVpYDJGcN8cP9WPFadwfRmNyZSVQpngUJW81");

export function useAnchorProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet || !wallet.publicKey || !wallet.signTransaction) return null;
    return new AnchorProvider(connection, wallet, {
      preflightCommitment: "processed",
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(idl, PROGRAM_ID, provider);
  }, [provider]);

  return { program, publicKey: wallet?.publicKey };
}

