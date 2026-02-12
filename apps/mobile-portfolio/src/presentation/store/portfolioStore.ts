class PortfolioStore {
  private selectedAccountId: string | null = null;
  private listeners: Set<(id: string | null) => void> = new Set();

  getSelectedAccountId(): string | null {
    return this.selectedAccountId;
  }

  setSelectedAccountId(id: string | null): void {
    if (this.selectedAccountId !== id) {
      this.selectedAccountId = id;
      this.notifyListeners(id);
    }
  }

  subscribe(listener: (id: string | null) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(id: string | null): void {
    this.listeners.forEach((listener) => listener(id));
  }
}

export const portfolioStore = new PortfolioStore();
