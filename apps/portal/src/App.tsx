import styled from "@emotion/styled";
import { CTA_CLICK, PAGE_VIEW } from "@fintech/analytics";
import { useAnalytics, useFeatureIsOn, useFeatureValue } from "@fintech/analytics/react";
import { useEffect } from "react";

const Root = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--foreground);
`;

const Subtitle = styled.p`
  color: var(--muted-foreground);
  text-align: center;
  max-width: 28rem;
`;

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
`;

function App() {
  const analytics = useAnalytics();
  const useNewCta = useFeatureIsOn("portal-new-cta");
  const ctaLabel = useFeatureValue("portal-cta-label", "Get started");

  useEffect(() => {
    analytics.track(PAGE_VIEW, { path: "/" });
  }, [analytics]);

  const handleCtaClick = () => {
    analytics.track(CTA_CLICK, { cta: "get_started", variant: useNewCta ? "new" : "legacy" });
  };

  return (
    <Root>
      <Title>FinPulse Portal</Title>
      <Subtitle>
        Portal app — Robinhood-style fintech experience.
      </Subtitle>
      <PrimaryButton type="button" onClick={handleCtaClick}>
        {ctaLabel}
      </PrimaryButton>
    </Root>
  );
}

export default App;
