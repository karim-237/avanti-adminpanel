import { Metadata } from 'next'
import OverviewClient from './overview-client'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
}

export default function DashboardPage() {
  return <OverviewClient />
}
