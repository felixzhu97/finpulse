class ApiPaths:
    PREFIX = "/api/v1"
    PORTFOLIO = f"{PREFIX}/portfolio"
    SEED = f"{PREFIX}/seed"
    BLOCKCHAIN_BLOCKS = f"{PREFIX}/blockchain/blocks"
    BLOCKCHAIN_BLOCK = f"{PREFIX}/blockchain/blocks"
    BLOCKCHAIN_SEED_BALANCE = f"{PREFIX}/blockchain/seed-balance"
    BLOCKCHAIN_TRANSFERS = f"{PREFIX}/blockchain/transfers"
    BLOCKCHAIN_BALANCES = f"{PREFIX}/blockchain/balances"
    BLOCKCHAIN_TRANSACTIONS = f"{PREFIX}/blockchain/transactions"
    RISK_METRICS_COMPUTE = f"{PREFIX}/risk-metrics/compute"
    ACCOUNTS = f"{PREFIX}/accounts"
    QUOTES = f"{PREFIX}/quotes"
    CUSTOMERS = f"{PREFIX}/customers"
    USER_PREFERENCES = f"{PREFIX}/user-preferences"
    INSTRUMENTS = f"{PREFIX}/instruments"
    BONDS = f"{PREFIX}/bonds"
    OPTIONS = f"{PREFIX}/options"
    PORTFOLIOS = f"{PREFIX}/portfolios"
    POSITIONS = f"{PREFIX}/positions"
    WATCHLISTS = f"{PREFIX}/watchlists"
    WATCHLIST_ITEMS = f"{PREFIX}/watchlist-items"
    ORDERS = f"{PREFIX}/orders"
    TRADES = f"{PREFIX}/trades"
    CASH_TRANSACTIONS = f"{PREFIX}/cash-transactions"
    PAYMENTS = f"{PREFIX}/payments"
    SETTLEMENTS = f"{PREFIX}/settlements"
    MARKET_DATA = f"{PREFIX}/market-data"
    RISK_METRICS = f"{PREFIX}/risk-metrics"
    VALUATIONS = f"{PREFIX}/valuations"

    @classmethod
    def account_by_id(cls, account_id: str) -> str:
        return f"{cls.ACCOUNTS}/{account_id}"

    @classmethod
    def blockchain_block(cls, block_index: int) -> str:
        return f"{cls.BLOCKCHAIN_BLOCK}/{block_index}"

    @classmethod
    def blockchain_balances(cls, account_id: str, currency: str) -> str:
        return f"{cls.BLOCKCHAIN_BALANCES}?account_id={account_id}&currency={currency}"

    @classmethod
    def blockchain_transaction(cls, tx_id: str) -> str:
        return f"{cls.BLOCKCHAIN_TRANSACTIONS}/{tx_id}"

    @classmethod
    def customer_by_id(cls, customer_id: str) -> str:
        return f"{cls.CUSTOMERS}/{customer_id}"

    @classmethod
    def user_preference_by_id(cls, preference_id: str) -> str:
        return f"{cls.USER_PREFERENCES}/{preference_id}"

    @classmethod
    def instrument_by_id(cls, instrument_id: str) -> str:
        return f"{cls.INSTRUMENTS}/{instrument_id}"

    @classmethod
    def bond_by_id(cls, bond_id: str) -> str:
        return f"{cls.BONDS}/{bond_id}"

    @classmethod
    def option_by_id(cls, option_id: str) -> str:
        return f"{cls.OPTIONS}/{option_id}"

    @classmethod
    def portfolio_by_id(cls, portfolio_id: str) -> str:
        return f"{cls.PORTFOLIOS}/{portfolio_id}"

    @classmethod
    def position_by_id(cls, position_id: str) -> str:
        return f"{cls.POSITIONS}/{position_id}"

    @classmethod
    def watchlist_by_id(cls, watchlist_id: str) -> str:
        return f"{cls.WATCHLISTS}/{watchlist_id}"

    @classmethod
    def watchlist_item_by_id(cls, item_id: str) -> str:
        return f"{cls.WATCHLIST_ITEMS}/{item_id}"

    @classmethod
    def order_by_id(cls, order_id: str) -> str:
        return f"{cls.ORDERS}/{order_id}"

    @classmethod
    def trade_by_id(cls, trade_id: str) -> str:
        return f"{cls.TRADES}/{trade_id}"

    @classmethod
    def cash_transaction_by_id(cls, transaction_id: str) -> str:
        return f"{cls.CASH_TRANSACTIONS}/{transaction_id}"

    @classmethod
    def payment_by_id(cls, payment_id: str) -> str:
        return f"{cls.PAYMENTS}/{payment_id}"

    @classmethod
    def settlement_by_id(cls, settlement_id: str) -> str:
        return f"{cls.SETTLEMENTS}/{settlement_id}"

    @classmethod
    def market_data_by_id(cls, data_id: str) -> str:
        return f"{cls.MARKET_DATA}/{data_id}"

    @classmethod
    def risk_metric_by_id(cls, metric_id: str) -> str:
        return f"{cls.RISK_METRICS}/{metric_id}"

    @classmethod
    def valuation_by_id(cls, valuation_id: str) -> str:
        return f"{cls.VALUATIONS}/{valuation_id}"
