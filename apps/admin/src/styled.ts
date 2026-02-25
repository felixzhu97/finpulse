import styled from '@emotion/styled'

export const AppRoot = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--background);
`

export const MainCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 16rem;
`

export const Main = styled.main`
  flex: 1;
  padding: 2rem;
  overflow: auto;
`

export const Card = styled.div`
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
`

export const CardHeader = styled.div`
  padding: 1.25rem 1.5rem 0.5rem;
`

export const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--foreground);
`

export const CardContent = styled.div`
  padding: 0 1.5rem 1.5rem;
`

export const PageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 2rem;
`

export const Col12 = styled.div` grid-column: span 12; `
export const Col8 = styled.div` grid-column: span 8; `
export const Col7 = styled.div` grid-column: span 7; `
export const Col5 = styled.div` grid-column: span 5; `
export const Col4 = styled.div` grid-column: span 4; `
export const Col3 = styled.div` grid-column: span 3; `

export const Grid4 = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.25rem;
`

export const StyledButton = styled.button<{ variant?: 'default' | 'ghost'; size?: 'default' | 'sm' | 'icon'; active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s, opacity 0.15s;
  ${(p) => (p.size === 'icon' ? 'width: 2.25rem; height: 2.25rem; padding: 0;' : p.size === 'sm' ? 'height: 2rem; padding-left: 0.75rem; padding-right: 0.75rem;' : 'height: 2.25rem; padding-left: 1rem; padding-right: 1rem;')}
  ${(p) =>
    p.variant === 'ghost'
      ? `background: transparent; color: var(--muted-foreground); &:hover { background: var(--secondary); color: var(--foreground); }`
      : `background: var(--primary); color: var(--primary-foreground); &:hover { opacity: 0.92; }`}
  ${(p) => p.active && `background: var(--primary); color: var(--primary-foreground);`}
  &:disabled { pointer-events: none; opacity: 0.5; }
`

export const StyledInput = styled.input`
  width: 100%;
  height: 2.25rem;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--secondary);
  color: var(--foreground);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus { border-color: var(--primary); box-shadow: 0 0 0 2px oklch(0.78 0.19 145 / 0.2); }
`

export const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
`

export const StyledAvatar = styled.div`
  border-radius: 9999px;
  overflow: hidden;
  flex-shrink: 0;
`

export const StyledProgress = styled.div<{ value: number }>`
  height: 0.375rem;
  background: var(--secondary);
  border-radius: 9999px;
  overflow: hidden;
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${(p) => Math.min(100, Math.max(0, p.value))}%;
    background: var(--primary);
    border-radius: 9999px;
    transition: width 0.2s ease;
  }
`

export const MutedText = styled.span`
  font-size: 0.875rem;
  color: var(--muted-foreground);
`

export const Subtitle = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--muted-foreground);
`

export const AgGridWrap = styled.div`
  height: 600px;
  width: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
`
