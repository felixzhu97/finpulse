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
    "AAPL", "TSLA", "GOOG", "META", "MSFT", "AMZN",
    "9988.HK", "0700.HK", "3690.HK", "1810.HK",
  ]
  state = {
    "AAPL": 273.34,
    "TSLA": 419.29,
    "GOOG": 325.71,
    "META": 668.60,
    "MSFT": 411.71,
    "AMZN": 209.72,
    "9988.HK": 157.90,
    "0700.HK": 560.00,
    "3690.HK": 91.05,
    "1810.HK": 35.20,
  }

  try:
    while True:
      now = time.time()
      for symbol in symbols:
        last = state[symbol]
        delta = random.uniform(-1.0, 1.0)
        price = max(1.0, last + delta)
        change = price - last
        change_rate = change / last if last else 0.0
        state[symbol] = price

        payload = {
          "symbol": symbol,
          "price": price,
          "change": change,
          "changeRate": change_rate,
          "ts": now,
        }
        producer.produce(topic, value=json.dumps(payload).encode("utf-8"))

      producer.flush(1.0)
      time.sleep(1)
  except KeyboardInterrupt:
    print("Stopped by user")


if __name__ == "__main__":
  main()

