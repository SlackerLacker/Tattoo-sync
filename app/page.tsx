import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to schedule page as the default
  redirect("/schedule")
}
