import { Link, useLocation } from 'react-router-dom'

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const title =
    pathname === '/' ? 'ホーム' :
    pathname.startsWith('/cards') ? '暗記カード' :
    pathname.startsWith('/settings') ? '設定' : ''

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-sky-400">税理士</Link>
        <h1 className="text-sm text-slate-300">{title}</h1>
        <Link to="/settings" className="text-xs text-slate-400">設定</Link>
      </header>
      <main className="flex-1 p-4 max-w-2xl w-full mx-auto">{children}</main>
    </div>
  )
}
