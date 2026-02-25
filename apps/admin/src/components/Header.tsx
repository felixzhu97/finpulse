import { useState } from 'react'
import styled from '@emotion/styled'
import { StyledButton, StyledInput, StyledBadge, StyledAvatar } from '@/styled'

const StyledHeader = styled.header`
  height: 4rem;
  border-bottom: 1px solid var(--border);
  background: oklch(0.14 0.015 260 / 0.5);
  backdrop-filter: blur(4px);
  position: sticky;
  top: 0;
  z-index: 40;
`

const HeaderInner = styled.div`
  height: 100%;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const SearchWrap = styled.div`
  position: relative;
  width: 24rem;
`

const SearchIcon = styled.svg`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--muted-foreground);
`

const SearchInput = styled(StyledInput)`
  padding-left: 2.5rem;
  background: oklch(0.2 0.02 260 / 0.5);
  border-color: var(--border);
  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px oklch(0.65 0.2 250 / 0.2);
  }
`

const Kbd = styled.kbd`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  background: var(--muted);
  color: var(--muted-foreground);
  border-radius: 0.25rem;
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const MarketBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  background: oklch(0.7 0.22 160 / 0.1);
  border: 1px solid oklch(0.7 0.22 160 / 0.2);
`

const MarketDot = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: var(--accent);
  animation: pulse 2s ease-in-out infinite;
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const UserInfo = styled.div`
  text-align: left;
  @media (max-width: 1024px) {
    display: none;
  }
`

const UserName = styled.p`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
`

const UserRole = styled.p`
  margin: 0;
  font-size: 0.75rem;
  color: var(--muted-foreground);
`

const NotificationBtn = styled(StyledButton)`
  position: relative;
`

const NotificationBadge = styled(StyledBadge)`
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  font-size: 0.75rem;
  background: var(--destructive);
  color: var(--destructive-foreground);
`

const AvatarButton = styled(StyledButton)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 0.5rem;
  padding-right: 0.75rem;
  height: auto;
  min-height: 2.25rem;
`

export function Header() {
  const [darkMode, setDarkMode] = useState(true)

  const toggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <StyledHeader>
      <HeaderInner>
        <SearchWrap>
          <SearchIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </SearchIcon>
          <SearchInput placeholder="Search stocks, funds, assets..." type="search" />
          <Kbd>⌘K</Kbd>
        </SearchWrap>

        <Actions>
          <MarketBadge>
            <MarketDot />
            <span style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 500 }}>Market Open</span>
          </MarketBadge>

          <StyledButton variant="ghost" size="icon" type="button">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </StyledButton>

          <StyledButton variant="ghost" size="icon" type="button" onClick={toggleDarkMode}>
            {darkMode ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </StyledButton>

          <NotificationBtn variant="ghost" size="icon" type="button">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <NotificationBadge>3</NotificationBadge>
          </NotificationBtn>

          <AvatarButton variant="ghost" type="button">
            <StyledAvatar style={{ width: 32, height: 32, border: '2px solid oklch(0.65 0.2 250 / 0.5)' }}>
              <AvatarImg src="/assets/buffett-avatar.png" alt="Warren Buffett" />
            </StyledAvatar>
            <UserInfo>
              <UserName>John Chen</UserName>
              <UserRole>Senior Analyst</UserRole>
            </UserInfo>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--muted-foreground)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </AvatarButton>
        </Actions>
      </HeaderInner>
    </StyledHeader>
  )
}
