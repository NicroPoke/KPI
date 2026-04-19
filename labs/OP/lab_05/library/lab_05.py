import asyncio
import threading
import time
from concurrent.futures import ThreadPoolExecutor


class CancelToken:
    def __init__(self) -> None:
        self._event = threading.Event()

    def cancel(self) -> None:
        self._event.set()

    def is_cancelled(self) -> bool:
        return self._event.is_set()


_EXECUTOR = ThreadPoolExecutor(max_workers=4)


def _map_worker(
    items,
    mapper,
    delay=0.0,
    cancel_token=None,
):
    result = []
    for item in items:
        if cancel_token and cancel_token.is_cancelled():
            raise RuntimeError("async_map aborted")
        if delay > 0:
            time.sleep(delay)
        result.append(mapper(item))
    return result


def async_map_callback(
    items,
    mapper,
    on_done,
    on_error=None,
    delay=0.0,
    cancel_token=None,
):
    def runner():
        try:
            on_done(_map_worker(items, mapper, delay=delay, cancel_token=cancel_token))
        except Exception as exc:
            if on_error:
                on_error(exc)

    thread = threading.Thread(target=runner, daemon=True)
    thread.start()
    return thread


def async_map_promise(
    items,
    mapper,
    delay=0.0,
    cancel_token=None,
):
    return _EXECUTOR.submit(
        _map_worker,
        items,
        mapper,
        delay=delay,
        cancel_token=cancel_token,
    )


async def async_map_await(
    items,
    mapper,
    delay=0.0,
    cancel_token=None,
):
    future = async_map_promise(items, mapper, delay=delay, cancel_token=cancel_token)
    return await asyncio.wrap_future(future)


def demo_progress():
    demo_data = [1, 2, 3, 4]
    callback_ready = threading.Event()
    callback_box = {}

    def on_done(values):
        callback_box["callback"] = values
        callback_ready.set()

    def on_error(exc):
        callback_box["callback_error"] = str(exc)
        callback_ready.set()

    async_map_callback(demo_data, lambda x: x * 10, on_done, on_error, delay=0.01)
    callback_ready.wait(timeout=2)

    future = async_map_promise(demo_data, lambda x: x + 1, delay=0.01)
    callback_box["future"] = future.result(timeout=2)

    callback_box["async_await"] = asyncio.run(
        async_map_await(demo_data, lambda x: x * x, delay=0.01)
    )

    token = CancelToken()
    abort_future = async_map_promise(demo_data * 3, lambda x: x, delay=0.05, cancel_token=token)
    time.sleep(0.08)
    token.cancel()
    try:
        abort_future.result(timeout=2)
        callback_box["abort"] = "not cancelled"
    except Exception as exc:
        callback_box["abort"] = f"cancelled: {exc}"

    return callback_box


def hello_lab():
    return "Lab 05 started: async map variants."
