import asyncio
import threading
import time
from concurrent.futures import Future, ThreadPoolExecutor


class AbortError(Exception):
    pass


class AbortSignal:
    def __init__(self) -> None:
        self.aborted = False
        self._listeners = []

    def add_event_listener(self, event_name, callback) -> None:
        if event_name != "abort":
            return
        self._listeners.append(callback)

    def remove_event_listener(self, event_name, callback) -> None:
        if event_name != "abort":
            return
        self._listeners = [cb for cb in self._listeners if cb is not callback]

    def _dispatch_abort(self) -> None:
        for callback in list(self._listeners):
            callback()


class AbortController:
    def __init__(self) -> None:
        self.signal = AbortSignal()

    def abort(self) -> None:
        if self.signal.aborted:
            return
        self.signal.aborted = True
        self.signal._dispatch_abort()


CancelToken = AbortController


_EXECUTOR = ThreadPoolExecutor(max_workers=4)


def _aborted(signal, abort_event):
    return (signal and signal.aborted) or (abort_event and abort_event.is_set())


def _aborted_future():
    f = Future()
    f.set_exception(AbortError("async_map aborted"))
    return f


def _map_worker(items, mapper, delay=0.0, signal=None, abort_event=None):
    result = []
    for item in items:
        if _aborted(signal, abort_event):
            raise AbortError("async_map aborted")
        if delay > 0:
            time.sleep(delay)
        if _aborted(signal, abort_event):
            raise AbortError("async_map aborted")
        result.append(mapper(item))
    return result


def async_map_callback(items, mapper, callback, delay=0.0, signal=None):
    abort_event = threading.Event()

    def on_abort() -> None:
        abort_event.set()

    if signal:
        signal.add_event_listener("abort", on_abort)
        if signal.aborted:
            signal.remove_event_listener("abort", on_abort)
            callback(AbortError("async_map aborted"), None)
            return None

    def runner():
        try:
            values = _map_worker(
                items,
                mapper,
                delay=delay,
                signal=signal,
                abort_event=abort_event,
            )
            callback(None, values)
        except Exception as exc:
            callback(exc, None)
        finally:
            if signal:
                signal.remove_event_listener("abort", on_abort)

    thread = threading.Thread(target=runner, daemon=True)
    thread.start()
    return thread


def async_map_promise(items, mapper, delay=0.0, signal=None):
    abort_event = threading.Event()

    def on_abort() -> None:
        abort_event.set()

    if signal:
        signal.add_event_listener("abort", on_abort)
        if signal.aborted:
            signal.remove_event_listener("abort", on_abort)
            return _aborted_future()

    future = _EXECUTOR.submit(
        _map_worker,
        items,
        mapper,
        delay,
        signal,
        abort_event,
    )

    if signal:
        def cleanup(_):
            signal.remove_event_listener("abort", on_abort)

        future.add_done_callback(cleanup)

    return future


async def async_map_await(items, mapper, delay=0.0, signal=None):
    future = async_map_promise(items, mapper, delay=delay, signal=signal)
    return await asyncio.wrap_future(future)


def demo_callback_case():
    data = [1, 2, 3, 4]
    callback_ready = threading.Event()
    out = {}

    def done(err, values):
        if err:
            out["error"] = str(err)
        else:
            out["result"] = values
        callback_ready.set()

    async_map_callback(data, lambda x: x * 10, done, delay=0.01)
    callback_ready.wait(timeout=2)
    return out


def demo_callback_abort_case():
    data = [1, 2, 3, 4] * 3
    callback_ready = threading.Event()
    out = {}
    controller = AbortController()

    def done(err, values):
        if err:
            out["status"] = "cancelled"
            out["error"] = str(err)
        else:
            out["status"] = "ok"
            out["result"] = values
        callback_ready.set()

    async_map_callback(data, lambda x: x, done, delay=0.05, signal=controller.signal)
    time.sleep(0.08)
    controller.abort()
    callback_ready.wait(timeout=2)
    return out


def demo_promise_case():
    data = [1, 2, 3, 4]
    future = async_map_promise(data, lambda x: x + 1, delay=0.01)
    return {"result": future.result(timeout=2)}


async def demo_async_await_case():
    data = [1, 2, 3, 4]
    values = await async_map_await(data, lambda x: x * x, delay=0.01)
    return {"result": values}


def demo_abort_case():
    data = [1, 2, 3, 4] * 3
    controller = AbortController()
    future = async_map_promise(data, lambda x: x, delay=0.05, signal=controller.signal)
    time.sleep(0.08)
    controller.abort()
    try:
        future.result(timeout=2)
        return {"status": "not_cancelled"}
    except Exception as exc:
        return {"status": "cancelled", "error": str(exc)}


def demo_cases():
    return {
        "callback": demo_callback_case(),
        "callback_abort": demo_callback_abort_case(),
        "promise": demo_promise_case(),
        "async_await": asyncio.run(demo_async_await_case()),
        "abort": demo_abort_case(),
    }


def demo_progress():
    return demo_cases()


def hello_lab():
    return "Lab 05: async map variants complete."
