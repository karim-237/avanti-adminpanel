'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getMessageById, deleteMessage } from '@/lib/actions/message.actions'
import { useToast } from '@/hooks/use-toast'

interface Message {
    id: number
    name?: string | null
    email?: string | null
    subject?: string | null
    message?: string | null
    created_at?: string | Date | null
}

interface MessagePageProps {
    params: { id: string }
}

export default function MessagePage({ params }: MessagePageProps) {
    const router = useRouter()
    const { toast } = useToast()
    const numericId = Number(params.id)

    const [message, setMessage] = useState<Message | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (Number.isNaN(numericId)) {
            router.push('/admin/messages')
            return
        }

        async function load() {
            try {
                const data = await getMessageById(numericId)
                setMessage(data)
            } catch (err) {
                console.error(err)
                router.push('/admin/messages')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [numericId, router])

    // Early return pour loading
    if (loading) return <p>Chargement du message...</p>
    if (!message) return <p>Message introuvable</p>

    // ✅ Ici, TS sait qu'on a message, mais on ajoute `!` pour lever toute ambiguïté
    const m = message!

    async function handleDelete() {
        const confirmed = confirm('Voulez-vous vraiment supprimer ce message ?')
        if (!confirmed) return

        const res = await deleteMessage(m.id)
        if (res.success) {
            toast({ description: res.message })
            router.push('/admin/messages')
        } else {
            toast({ variant: 'destructive', description: res.message })
        }
    }

    return (
        <main className="max-w-3xl mx-auto p-4 space-y-6">
            <div className="flex mb-4 gap-2">
                <Link href="/admin/messages" className="text-blue-600 hover:underline">
                    Messages
                </Link>
                <span>›</span>
                <span>{m.subject}</span>
            </div>

            <div className="space-y-4 p-4 border rounded bg-muted">
                <div>
                    <strong>Nom :</strong> {m.name ?? '-'}
                </div>
                <div>
                    <strong>Email :</strong> {m.email ?? '-'}
                </div>
                <div>
                    <strong>Sujet :</strong> {m.subject ?? '-'}
                </div>
                <div>
                    <strong>Message :</strong>
                    <p className="mt-2 whitespace-pre-line">{m.message ?? '-'}</p>
                </div>
                <div>
                    <strong>Reçu le :</strong>{' '}
                    {m.created_at
                        ? `${new Date(m.created_at).toLocaleDateString()} à ${new Date(m.created_at).toLocaleTimeString()}`
                        : '-'}
                </div>


                <div className="flex gap-2 mt-4">
                    <Button variant="destructive" onClick={handleDelete}>
                        Supprimer le message
                    </Button>
                    <Button asChild>
                        <Link href="/admin/messages">Retour à la liste</Link>
                    </Button>
                </div>
            </div>
        </main>
    )
}
