"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Wallet } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  "email rate limit exceeded":
    "Demasiados intentos. Espera 1 minuto antes de volver a intentarlo.",
  "Invalid login credentials":
    "Email o contraseña incorrectos.",
  "Email not confirmed":
    "Confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.",
  "User already registered":
    "Este email ya está registrado. Inicia sesión.",
};

function translateError(err: any): string {
  const msg = err?.message ?? "";
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (msg.toLowerCase().includes(key)) return value;
  }
  return msg || "Error de autenticación";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const supabase = createClient();
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Revisa tu email para confirmar la cuenta");
        setCooldown(30);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
      }
    } catch (err: any) {
      const translated = translateError(err);
      setError(translated);
      if (err?.message?.toLowerCase().includes("rate limit")) {
        setCooldown(60);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
        <Wallet className="w-8 h-8 text-primary-600" />
      </div>

      <h1 className="text-2xl font-bold mb-1">Mis Gastos</h1>
      <p className="text-sm text-gray-500 mb-8">
        {isRegister ? "Crear una cuenta" : "Inicia sesión"}
      </p>

      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            id="password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              {success}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || cooldown > 0}
            className="w-full"
          >
            {loading
              ? "Procesando..."
              : cooldown > 0
                ? `Espera ${cooldown}s...`
                : isRegister
                  ? "Crear Cuenta"
                  : "Iniciar Sesión"}
          </Button>

          {cooldown > 0 && (
            <p className="text-xs text-gray-400 text-center">
              Límite de intentos alcanzado. Puedes seguir intentando en {cooldown}s.
            </p>
          )}
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setSuccess("");
            }}
            className="text-sm text-primary-600 hover:underline"
          >
            {isRegister
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>
      </Card>
    </div>
  );
}
