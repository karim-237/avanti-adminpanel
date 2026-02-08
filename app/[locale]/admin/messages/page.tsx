import { Metadata } from 'next'
import MessageList from './message-list'

export const metadata: Metadata = {
  title: 'Admin Messages',
}

export default async function AdminMessages() {
  return <MessageList />
}
