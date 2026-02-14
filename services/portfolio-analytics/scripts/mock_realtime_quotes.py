import json
import os
import random
import sys
import time

from confluent_kafka import Producer

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from src.infrastructure.market_data.nasdaq_symbols import NASDAQ_200_SYMBOLS, initial_prices


def main() -> None:
  bootstrap = os.environ.get("KAFKA_BOOTSTRAP_SERVERS", "127.0.0.1:9092")
  topic = os.environ.get("KAFKA_QUOTES_ENRICHED_TOPIC", "market.quotes.enriched")
  print(f"Using Kafka {bootstrap}, topic {topic}")

  producer = Producer({"bootstrap.servers": bootstrap})
  symbols = NASDAQ_200_SYMBOLS
  state = dict(initial_prices())

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

        volume = random.randint(100000, 5000000)
        
        payload = {
          "symbol": symbol,
          "price": round(price, 2),
          "change": round(change, 2),
          "changeRate": round(change_rate, 4),
          "volume": volume,
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

