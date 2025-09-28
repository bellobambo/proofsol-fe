"use client";
import { useAnchorProgram } from "@/lib/anchor";
import React, { useState } from "react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

interface RegisterUserFormProps {
  onRegistered?: () => void;
}

export default function RegisterUserForm({ onRegistered }: RegisterUserFormProps) {
  const { program, publicKey } = useAnchorProgram();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Student");
  const [matricNumber, setMatricNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !publicKey) {
      alert("Connect wallet first");
      return;
    }
    setLoading(true);

    try {
      // Convert role string to enum format expected by the program
      const roleEnum = role === "Student" ? { student: {} } : { lecturer: {} };

      // Handle matricNumber as optional field
      const matricNumberValue =
        role === "Student" && matricNumber.trim() !== ""
          ? matricNumber
          : null;

      // Find the PDA for the user account
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user"), publicKey.toBuffer()],
        program.programId
      );

      console.log("Registering with:", {
        role: roleEnum,
        name,
        matricNumber: matricNumberValue,
        userAccount: userPda.toString(),
        authority: publicKey.toString()
      });

      // Call the registerUser instruction - only the authority needs to sign
      const tx = await program.methods
        .registerUser(roleEnum, name, matricNumberValue)
        .accounts({
          user: userPda,  // Use the PDA, not a generated keypair
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Transaction successful:", tx);
      alert("Registered successfully! ✅");

      if (onRegistered) {
        onRegistered();
      }

      // Reset form
      setName("");
      setMatricNumber("");
    } catch (err: any) {
      console.error("Registration error:", err);
      console.log("Full error object:", err);

      // Check if it's a "already processed" error which might indicate success
      if (err.message?.includes('already processed')) {
        // This might actually be a success case - the transaction went through
        console.log("Transaction may have succeeded despite error");
        alert("Registration completed! Please refresh the page.");

        if (onRegistered) {
          onRegistered();
        }
      }
      // Check if it's an account already exists error
      else if (err.message?.includes('account already exists') ||
        err.message?.includes('already in use')) {
        alert("You are already registered! ✅");

        if (onRegistered) {
          onRegistered();
        }
      }
      else if (err.message) {
        alert(`Registration failed: ${err.message}`);
      } else if (err.logs) {
        console.log("Program logs:", err.logs);
        alert("Registration failed. Check console for details.");
      } else {
        alert("Registration failed. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 p-4 max-w-md mx-auto">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Student">Student</option>
          <option value="Lecturer">Lecturer</option>
        </select>
      </div>

      {role === "Student" && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Matric Number
            <span className="text-gray-500 text-xs ml-1">(Optional)</span>
          </label>
          <input
            value={matricNumber}
            onChange={(e) => setMatricNumber(e.target.value)}
            placeholder="Enter your matric number"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Providing a matric number helps identify you in the system
          </p>
        </div>
      )}

      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        disabled={loading || !program || !publicKey}
      >
        {!publicKey ? "Connect Wallet" :
          loading ? "Registering..." : "Register"}
      </button>

      {!publicKey && (
        <p className="text-sm text-red-600 text-center">
          Please connect your wallet first
        </p>
      )}
    </form>
  );
}