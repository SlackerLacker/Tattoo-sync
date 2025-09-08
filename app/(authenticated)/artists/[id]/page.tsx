"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ArtistProfileClient from "./ArtistProfileClient"

export default function ArtistProfilePage() {
  const params = useParams()
  const id = params.id
  const [artist, setArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      const fetchArtist = async () => {
        try {
          setLoading(true)
          const response = await fetch(`/api/artists/${id}`)
          if (!response.ok) {
            throw new Error("Failed to fetch artist data")
          }
          const data = await response.json()
          setArtist(data)
        } catch (err: any) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
      fetchArtist()
    }
  }, [id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!artist) {
    return <div>Artist not found.</div>
  }

  return <ArtistProfileClient artist={artist} />
}
