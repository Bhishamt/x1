import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
    return format(new Date(date), 'dd MMM yyyy')
}

export function formatDateTime(date: string | Date): string {
    return format(new Date(date), 'dd MMM yyyy, hh:mm a')
}

export function timeAgo(date: string | Date): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getGradeColor(grade: string | null): string {
    const map: Record<string, string> = {
        O: 'text-emerald-400',
        'A+': 'text-green-400',
        A: 'text-lime-400',
        'B+': 'text-yellow-400',
        B: 'text-amber-400',
        C: 'text-orange-400',
        F: 'text-red-500',
    }
    return map[grade ?? ''] ?? 'text-slate-400'
}

export function getNotificationTypeStyles(type: string) {
    const map: Record<string, { icon: string; border: string; bg: string }> = {
        info: { icon: '💬', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
        success: { icon: '✅', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
        warning: { icon: '⚠️', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10' },
        error: { icon: '🚨', border: 'border-red-500/30', bg: 'bg-red-500/10' },
    }
    return map[type] ?? map['info']
}

export function getCategoryBadge(category: string) {
    const map: Record<string, string> = {
        general: 'bg-slate-500/20 text-slate-300',
        exam: 'bg-red-500/20 text-red-300',
        event: 'bg-purple-500/20 text-purple-300',
        placement: 'bg-emerald-500/20 text-emerald-300',
    }
    return map[category] ?? map['general']
}

export function percentage(obtained: number, max: number): string {
    return ((obtained / max) * 100).toFixed(1)
}
