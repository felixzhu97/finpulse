NASDAQ_200_SYMBOLS = [
    "INTC", "AMD", "ADBE", "CRM", "NFLX", "AVGO", "ORCL", "CSCO", "PEP", "COST",
    "ISRG", "GILD", "AMGN", "SBUX", "TMUS", "VRTX", "MDLZ", "KLAC", "SNPS", "MRVL",
    "PANW", "CDNS", "ASML", "LRCX",
    "ABNB", "ALGN", "AMAT", "ANSS", "ARM", "BIIB", "BKR", "CCEP", "CHTR", "CRWD",
    "CTAS", "CTSH", "DDOG", "DXCM", "EA", "EBAY", "ENPH", "EXC", "FANG", "FAST",
    "FISV", "FTNT", "GEHC", "GFS", "HON", "IDXX", "ILMN", "KDP", "KHC", "LULU",
    "MCHP", "MDB", "MELI", "MNST", "MRNA", "NTES", "NXPI", "ODFL", "ON", "PAYX",
    "PCAR", "PDD", "PYPL", "QCOM", "REGN", "ROST", "SIRI", "TEAM", "TXN", "WBA",
    "XEL", "ZS", "AKAM", "ALNY", "BIDU", "BMRN", "CDW", "CHKP", "CMCSA", "CPRT",
    "CSGP", "DLTR", "EXPE", "FLEX", "HII", "ICUI", "INCY", "INTU", "JD", "MAR",
    "NTAP", "OKTA", "QGEN", "SPLK", "SWKS", "TCOM", "TRIP", "TTWO", "VRSK", "WDAY",
    "WDC", "ZBRA", "AEP", "AMED", "APLS", "ARWR", "AXON", "CARG", "CGNX", "CRUS",
    "DASH", "DOCU", "FOLD", "FROG", "GEN", "HZNP", "ICLR", "IOVA", "IRDM", "JAZZ",
    "LCID", "LPLA", "MASI", "MKTX", "MODV", "NBIX", "NCNO", "NUVL", "OPEN", "PODD",
    "RARE", "RGNX", "RIVN", "RUN", "SKY", "SMCI", "TNDM", "TREE", "TWST", "UAL",
    "VTRS", "WIX", "Z", "ZION", "AFRM", "AI", "BROS", "CELH", "CFLT", "COIN",
    "DKNG", "DPZ", "FICO", "FSLR", "GDDY", "GTLB", "HUBS", "IRTC", "LI", "MSTR",
    "NU", "PATH", "RBLX", "ROKU", "SHOP", "SNOW", "SOFI", "TTD", "UBER", "VEEV",
    "WBD", "ZM", "MU", "WMT", "GOOG", "META", "TSLA", "ADSK", "PLTR",
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "NDAQ", "BKNG", "ADI", "MTCH", "LBTYK",
    "LILAK", "QRTEA", "RDFN", "STX", "SYNA", "ZG", "YELP",
]


def initial_prices() -> dict[str, float]:
    return {s: 50.0 + (i % 300) for i, s in enumerate(NASDAQ_200_SYMBOLS)}
