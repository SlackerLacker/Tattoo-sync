"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    } else {
      router.push("/dashboard") // or wherever you're redirecting logged-in users
    }
  }

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h2 className="text-xl mb-4">Login</h2>
      <input className="input mb-2" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input className="input mb-2" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button className="btn btn-primary w-full" onClick={handleLogin}>Login</button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}