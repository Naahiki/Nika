"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "./layout"; 

export default function Dashboard() {
  const router = useRouter();
  const { userData } = useContext(AuthContext);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-lg mb-8">
        Bienvenido, <span className="font-medium">{userData?.user || "Usuario"}</span>
      </p>
      <button
        onClick={() => router.push("/contabilidad")}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Contabilidad
      </button>
    </div>
  );
}
