from __future__ import annotations

import asyncio
import concurrent.futures
from collections.abc import Coroutine
from typing import Callable, List, TypeVar

T = TypeVar("T")


def run_concurrent(
    fn: Callable[[int], T],
    concurrency: int,
    max_workers: int | None = None,
) -> List[T]:
    workers = max_workers or concurrency
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        futures = [executor.submit(fn, i) for i in range(concurrency)]
        return [f.result() for f in concurrent.futures.as_completed(futures)]


async def run_concurrent_async(
    fn: Callable[[int], Coroutine[None, None, T]],
    concurrency: int,
) -> List[T]:
    tasks = [fn(i) for i in range(concurrency)]
    return list(await asyncio.gather(*tasks))
