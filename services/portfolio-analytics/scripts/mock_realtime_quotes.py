import json
import os
import random
import time

from confluent_kafka import Producer


def main() -> None:
  bootstrap = os.environ.get("KAFKA_BOOTSTRAP_SERVERS", "127.0.0.1:9092")
  topic = os.environ.get("KAFKA_QUOTES_ENRICHED_TOPIC", "market.quotes.enriched")
  print(f"Using Kafka {bootstrap}, topic {topic}")

  producer = Producer({"bootstrap.servers": bootstrap})

  symbols = [
    "AAPL", "TSLA", "GOOG", "GOOGL", "META", "MSFT", "AMZN",
    "BRK.B", "JPM", "SPY", "NVDA",
  ]
  state = {
    "AAPL": 234.38,
    "TSLA": 419.29,
    "GOOG": 325.71,
    "GOOGL": 175.40,
    "META": 603.52,
    "MSFT": 411.71,
    "AMZN": 200.99,
    "BRK.B": 415.00,
    "JPM": 218.50,
    "SPY": 585.00,
    "NVDA": 875.28,
  }

  try:
    iteration = 0
    while True:
      now = time.time()
      iteration += 1
      pushed_count = 0
      
      for symbol in symbols:
        last = state[symbol]
        delta = random.uniform(-0.5, 0.5)
        price = max(1.0, last + delta)
        change = price - last
        change_rate = change / last if last else 0.0
        state[symbol] = price

        payload = {
          "symbol": symbol,
          "price": round(price, 2),
          "change": round(change, 2),
          "changeRate": round(change_rate, 4),
          "ts": now,
        }
        producer.produce(topic, key=symbol.encode("utf-8"), value=json.dumps(payload).encode("utf-8"))
        pushed_count += 1

      producer.flush(1.0)
      if iteration % 10 == 0:
        print(f"Pushed {pushed_count} quotes for {len(symbols)} symbols (iteration {iteration})")
      time.sleep(1)
  except KeyboardInterrupt:
    print("Stopped by user")


if __name__ == "__main__":
  main()

