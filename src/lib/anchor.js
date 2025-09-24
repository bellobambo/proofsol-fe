"use client";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import rawIdl from "./idl.json";

// Ensure the IDL has the correct structure expected by Anchor
const IDL = (() => {
  const idl = rawIdl?.default ?? rawIdl;
  
  // Add the version field if it's missing
  if (!idl.version) {
    return {
      version: "0.1.0",
      name: idl.name || "school_assess",
      instructions: idl.instructions || [],
      accounts: idl.accounts || [],
      types: idl.types || [],
      errors: idl.errors || [],
      metadata: {
        address: "Naccww3abFJ8Q6Tq6LVMpbNBGEmzgP12ezKLyv5NjMN"
      }
    };
  }
  
  return idl;
})();

export const PROGRAM_ID = new PublicKey(
  "Naccww3abFJ8Q6Tq6LVMpbNBGEmzgP12ezKLyv5NjMN"
);

export const useAnchorProgram = () => {
  const { connection } = useConnection();
  const wallet  = useWallet();

  const provider = useMemo(() => {
    if (!wallet || !wallet.publicKey || !wallet.signTransaction) return null;
    return new AnchorProvider(connection, wallet, {
      preflightCommitment: "processed",
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider || !IDL) return null;
    try {
      return new Program(IDL, PROGRAM_ID, provider);
    } catch (error) {
      console.error("Error creating program:", error);
      return null;
    }
  }, [provider]);

  // Debug log to verify IDL is loading correctly
  useEffect(() => {
    console.log("IDL loaded:", IDL);
    console.log("Program created:", program !== null);
  }, [program]);

  return { provider, program, publicKey: wallet.publicKey };
};