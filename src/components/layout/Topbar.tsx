import { Menu, Sun, Moon, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'

interface TopbarProps {
  title: string
  onMenuClick: () => void
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  const { profile, signOutUser } = useAuth()
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/75">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <h1 className="text-sm font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <div className="mx-1 hidden text-right sm:block">
          <p className="text-sm font-medium leading-none">{profile?.name}</p>
          <p className="text-xs text-muted-foreground">{profile?.role}</p>
        </div>

        <Button variant="ghost" size="icon" onClick={() => signOutUser()} aria-label="Sign out">
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  )
}
