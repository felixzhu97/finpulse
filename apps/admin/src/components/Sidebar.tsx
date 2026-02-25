import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import styled from '@emotion/styled'

interface MenuItem {
  icon: string
  label: string
  route: string
}

const ICONS: Record<string, string> = {
  dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  pie: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z',
  'line-chart': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  'credit-card': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  'file-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  help: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}

const menuItems: MenuItem[] = [
  { icon: 'dashboard', label: 'Dashboard', route: '/' },
  { icon: 'wallet', label: 'Portfolio', route: '/portfolio' },
  { icon: 'trending', label: 'Market Trends', route: '#' },
  { icon: 'pie', label: 'Asset Allocation', route: '#' },
  { icon: 'line-chart', label: 'Analytics', route: '#' },
  { icon: 'shield', label: 'Risk Management', route: '#' },
  { icon: 'credit-card', label: 'Transactions', route: '/transactions' },
  { icon: 'users', label: 'Clients', route: '/clients' },
  { icon: 'file-text', label: 'Reports', route: '/reports' },
]

const bottomItems: MenuItem[] = [
  { icon: 'bell', label: 'Notifications', route: '#' },
  { icon: 'settings', label: 'Settings', route: '#' },
  { icon: 'help', label: 'Help', route: '#' },
]

const Aside = styled.aside<{ collapsed: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: ${(p) => (p.collapsed ? '5rem' : '16rem')};
  background: var(--sidebar);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  z-index: 50;
`

const SidebarHeader = styled.div`
  height: 4rem;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  border-bottom: 1px solid var(--sidebar-border);
`

const LogoWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const LogoIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius);
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-glow 2.5s ease-in-out infinite;
`

const LogoText = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--primary);
`

const Nav = styled.nav`
  flex: 1;
  padding: 1.5rem 0.75rem;
  overflow-y: auto;
`

const NavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const NavItem = styled.a`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius);
  transition: background 0.15s, color 0.15s;
  color: var(--muted-foreground);
  text-decoration: none;
  &:hover {
    background: var(--secondary);
    color: var(--foreground);
  }
`

const StyledNavLink = styled(NavLink)`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius);
  transition: background 0.15s, color 0.15s;
  color: var(--muted-foreground);
  text-decoration: none;
  &:hover {
    background: var(--secondary);
    color: var(--foreground);
  }
  &.active {
    background: oklch(0.78 0.19 145 / 0.12);
    color: var(--primary);
    box-shadow: 0 0 0 1px oklch(0.78 0.19 145 / 0.12);
  }
`

const NavLabel = styled.span`
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const IconSvg = styled.svg`
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
`

const Bottom = styled.div`
  padding: 1rem 0.75rem;
  border-top: 1px solid var(--sidebar-border);
`

const BottomButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  border: none;
  background: none;
  color: var(--muted-foreground);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: var(--secondary);
    color: var(--foreground);
  }
`

const ToggleBtn = styled.button<{ collapsed: boolean }>`
  position: absolute;
  right: -0.75rem;
  top: 5rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  background: var(--card);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s;
  &:hover {
    background: var(--secondary);
  }
`

function Icon({ name }: { name: string }) {
  const d = ICONS[name] ?? ICONS.dashboard
  return (
    <IconSvg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </IconSvg>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <Aside collapsed={collapsed}>
      <SidebarHeader>
        <LogoWrap>
          <LogoIcon>
            <svg width="24" height="24" fill="none" stroke="var(--primary-foreground)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </LogoIcon>
          {!collapsed && <LogoText>FinPulse</LogoText>}
        </LogoWrap>
      </SidebarHeader>
      <Nav>
        <NavList>
          {menuItems.map((item) =>
            item.route.startsWith('#') ? (
              <NavItem key={item.route + item.label} href={item.route}>
                <Icon name={item.icon} />
                {!collapsed && <NavLabel>{item.label}</NavLabel>}
              </NavItem>
            ) : (
              <StyledNavLink key={item.route} to={item.route} end={item.route === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
                <Icon name={item.icon} />
                {!collapsed && <NavLabel>{item.label}</NavLabel>}
              </StyledNavLink>
            )
          )}
        </NavList>
      </Nav>
      <Bottom>
        <NavList>
          {bottomItems.map((item) => (
            <BottomButton key={item.icon} type="button">
              <Icon name={item.icon} />
              {!collapsed && <NavLabel>{item.label}</NavLabel>}
            </BottomButton>
          ))}
        </NavList>
      </Bottom>
      <ToggleBtn type="button" collapsed={collapsed} onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand' : 'Collapse'}>
        {collapsed ? (
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        )}
      </ToggleBtn>
    </Aside>
  )
}
