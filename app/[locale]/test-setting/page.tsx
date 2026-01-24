// app/test-setting/page.tsx
import { getNoCachedSetting } from '@/lib/actions/setting.actions'

export default async function TestSettingPage() {
  const setting = await getNoCachedSetting() // <- ici le log va s'afficher dans le terminal
  return (
    <pre>{JSON.stringify(setting, null, 2)}</pre>
  )
}
