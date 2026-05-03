import asyncio
from collections.abc import AsyncIterator, Callable
from typing import Any


class EventStream:
    def __init__(self) -> None:
        self._listeners: dict[str, list[Callable[[Any], None]]] = {
            "data": [],
            "error": [],
            "end": [],
        }

    def on(self, event_name: str, callback: Callable[[Any], None]) -> None:
        if event_name not in self._listeners:
            raise ValueError(f"Unsupported event: {event_name}")
        self._listeners[event_name].append(callback)

    def emit(self, event_name: str, payload: Any = None) -> None:
        if event_name not in self._listeners:
            raise ValueError(f"Unsupported event: {event_name}")
        for callback in list(self._listeners[event_name]):
            callback(payload)


async def large_number_stream(
    total_items: int,
    batch_size: int = 10_000,
    *,
    fail_on_item: int | None = None,
    delay_seconds: float = 0.0,
) -> AsyncIterator[list[int]]:
    if total_items < 0:
        raise ValueError("total_items must be >= 0")
    if batch_size <= 0:
        raise ValueError("batch_size must be > 0")
    if delay_seconds < 0:
        raise ValueError("delay_seconds must be >= 0")

    start = 0
    while start < total_items:
        end = min(start + batch_size, total_items)

        if fail_on_item is not None and start <= fail_on_item < end:
            raise RuntimeError(f"Producer failed on item {fail_on_item}")

        yield list(range(start, end))
        start = end

        if delay_seconds > 0:
            await asyncio.sleep(delay_seconds)


async def process_number_batches(batches: AsyncIterator[list[int]]) -> dict[str, float | int | None]:
    count = 0
    total = 0
    minimum: int | None = None
    maximum: int | None = None

    async for batch in batches:
        for value in batch:
            count += 1
            total += value
            minimum = value if minimum is None else min(minimum, value)
            maximum = value if maximum is None else max(maximum, value)

    average = (total / count) if count else None
    return {
        "count": count,
        "sum": total,
        "min": minimum,
        "max": maximum,
        "avg": average,
    }


def stream_to_events(
    producer: AsyncIterator[list[int]],
    event_stream: EventStream,
) -> asyncio.Task:
    async def _pump() -> None:
        try:
            async for batch in producer:
                event_stream.emit("data", batch)
            event_stream.emit("end", None)
        except Exception as exc:
            event_stream.emit("error", exc)

    return asyncio.create_task(_pump())


async def stream_from_events(event_stream: EventStream) -> AsyncIterator[list[int]]:
    queue: asyncio.Queue[tuple[str, Any]] = asyncio.Queue()

    event_stream.on("data", lambda payload: queue.put_nowait(("data", payload)))
    event_stream.on("error", lambda payload: queue.put_nowait(("error", payload)))
    event_stream.on("end", lambda payload: queue.put_nowait(("end", payload)))

    while True:
        event_name, payload = await queue.get()

        if event_name == "data":
            yield payload
            continue

        if event_name == "error":
            raise payload

        break


async def demo_success_case() -> dict[str, float | int | None]:
    source = large_number_stream(total_items=50_000, batch_size=5_000)
    return await process_number_batches(source)


async def demo_producer_error_case() -> str:
    source = large_number_stream(total_items=10_000, batch_size=2_000, fail_on_item=4_500)
    try:
        await process_number_batches(source)
        return "unexpected-success"
    except Exception as exc:
        return f"producer-error: {exc}"


async def demo_event_error_case() -> str:
    events = EventStream()
    source = large_number_stream(total_items=10_000, batch_size=2_000, fail_on_item=6_500)
    task = stream_to_events(source, events)

    try:
        await process_number_batches(stream_from_events(events))
        return "unexpected-success"
    except Exception as exc:
        return f"event-error: {exc}"
    finally:
        await task


def hello_lab() -> str:
    return "Lab 06: stream processing ready."
