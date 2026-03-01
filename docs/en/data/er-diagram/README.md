# ER Diagram

Conceptual entity-relationship diagram for a generic fintech system: core (customer, user preference, account, portfolio); reference and positions (instrument, position, watchlist, watchlist item); instrument extensions (bond, option); trading (order, trade); payments and settlement (transaction, payment, settlement); market and risk (market data, technical indicator, risk metrics); analytics and valuation (portfolio optimization, statistical, valuation). The diagram is defined in PlantUML Information Engineering notation.

**Implementation note**: CRUD for most entities (Customer, Account, Instrument, Portfolio, Position, Watchlist, Bond, Option, Order, Trade, Payment, Settlement, MarketData, etc.) is implemented by the **Go** server. **Python** retains RiskMetrics and Valuation repositories, plus portfolio aggregate and quote history. Entities are stored in shared PostgreSQL.

A Chinese copy is available in [docs/zh/data/er-diagram/](../../../zh/data/er-diagram/).

To generate an image from `er-diagram.puml`, use the PlantUML CLI or an IDE plugin:

```bash
plantuml docs/en/data/er-diagram/er-diagram.puml
```

Output will be written next to the source file (e.g. `er-diagram.png`). You can also paste the file contents into the [PlantUML online server](https://www.plantuml.com/plantuml/uml/) to view or export.
