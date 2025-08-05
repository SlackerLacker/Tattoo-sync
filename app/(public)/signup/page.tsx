"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

    export default function SignUp() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSignUp = async () => {
        setError("") // Clear previous errors

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            return
        }

        const user = data.user

        if (user) {
            // 🧠 Insert new artist into DB
            const { error: insertError } = await supabase.from("artists").insert({
            user_id: user.id,
            name: "New Artist", // Or collect this from the form
            bio: "",
            })

            if (insertError) {
            setError("Signed up, but failed to create artist profile: " + insertError.message)
            return
            }

            // ✅ Redirect to dashboard or wherever
            router.push("/dashboard")
        }
    }
    
  return (
    <div className="p-4 max-w-sm mx-auto">
      <h2 className="text-xl mb-4">Sign Up</h2>
      <input className="input mb-2" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input className="input mb-2" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button className="btn btn-primary w-full" onClick={handleSignUp}>Sign Up</button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}
