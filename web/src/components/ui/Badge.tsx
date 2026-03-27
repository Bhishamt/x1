import { cn } from '@/lib/utils'

interface BadgeProps {
    children: React.ReactNode
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline'
    className?: string
}

const variantMap: Record<string, string> = {
    default: 'bg-slate-500/20 text-slate-300',
    success: 'bg-emerald-500/20 text-emerald-300',
    warning: 'bg-yellow-500/20 text-yellow-300',
    danger: 'bg-red-500/20 text-red-300',
    info: 'bg-blue-500/20 text-blue-300',
    purple: 'bg-purple-500/20 text-purple-300',
    outline: 'border border-slate-700 text-slate-400',
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
    return (
        <span className={cn('badge', variantMap[variant], className)}>
            {children}
        </span>
    )
}
