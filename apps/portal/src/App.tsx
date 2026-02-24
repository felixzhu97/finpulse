import styled from '@emotion/styled'

const Root = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1.5rem;
`

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--foreground);
`

const Subtitle = styled.p`
  color: var(--muted-foreground);
  text-align: center;
  max-width: 28rem;
`

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  height: 2.25rem;
  padding-left: 1rem;
  padding-right: 1rem;
  background-color: var(--primary);
  color: var(--primary-foreground);
  border: none;
  cursor: pointer;
  transition: background-color 0.15s;
  &:hover {
    background-color: oklch(0.6 0.2 250 / 0.9);
  }
  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }
`

function App() {
  return (
    <Root>
      <Title>FinPulse Portal</Title>
      <Subtitle>
        Portal app — Robinhood-style fintech experience.
      </Subtitle>
      <PrimaryButton type="button">Get started</PrimaryButton>
    </Root>
  )
}

export default App
