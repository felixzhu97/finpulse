# ER Diagram

Conceptual entity-relationship diagram for a generic fintech system: core (customer, user preference, account, portfolio); reference and positions (instrument, position, watchlist, watchlist item); instrument extensions (bond, option); trading (order, trade); payments and settlement (transaction, payment, settlement); market and risk (market data, technical indicator, risk metrics); analytics and valuation (portfolio optimization, statistical, valuation). The diagram is defined in PlantUML Information Engineering notation.

A Chinese copy is available in [docs_ch/er-diagram](../../docs_ch/er-diagram/).

To generate an image from `er-diagram.puml`, use the PlantUML CLI or an IDE plugin:

```bash
plantuml docs/er-diagram/er-diagram.puml
```

Output will be written next to the source file (e.g. `er-diagram.png`). You can also paste the file contents into the [PlantUML online server](https://www.plantuml.com/plantuml/uml/) to view or export.
