import { Button } from '@fintech/ui'

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-semibold text-foreground">FinPulse Portal</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Portal app — Robinhood-style fintech experience.
      </p>
      <Button>Get started</Button>
    </div>
  )
}

export default App
