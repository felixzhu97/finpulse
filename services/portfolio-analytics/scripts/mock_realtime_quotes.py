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

  symbols = ["AAPL", "MSFT"]
  state = {"AAPL": 190.0, "MSFT": 420.0}

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

