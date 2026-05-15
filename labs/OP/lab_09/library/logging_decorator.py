import asyncio
import functools
import inspect
import json
import time
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Callable, Iterable


class LogLevel(Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    ERROR = "ERROR"


class Formatter:
    def format(self, entry: dict[str, Any]) -> str:
        raise NotImplementedError()


class SimpleFormatter(Formatter):
    def format(self, entry: dict[str, Any]) -> str:
        return f"{entry['timestamp']} {entry['level']}: {entry['message']}"


class JSONFormatter(Formatter):
    def format(self, entry: dict[str, Any]) -> str:
        return json.dumps(entry, ensure_ascii=False)


class Sink:
    def emit(self, text: str) -> None:
        raise NotImplementedError()


class ConsoleSink(Sink):
    def emit(self, text: str) -> None:
        print(text)


class FileSink(Sink):
    def __init__(self, path: str) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def emit(self, text: str) -> None:
        with open(self.path, "a", encoding="utf-8") as f:
            f.write(text + "\n")


class ExternalSink(Sink):
    def __init__(self) -> None:
        self.sent: list[str] = []

    def emit(self, text: str) -> None:
        self.sent.append(text)


class Logger:
    def __init__(self, sinks: Iterable[Sink] | None = None, formatter: Formatter | None = None) -> None:
        self.sinks = list(sinks) if sinks is not None else [ConsoleSink()]
        self.formatter = formatter or SimpleFormatter()
        self.entries: list[dict[str, Any]] = []

    def log(self, level: LogLevel, message: str, **meta: Any) -> None:
        timestamp = datetime.now(timezone.utc).isoformat()
        entry: dict[str, Any] = {"timestamp": timestamp, "level": level.value, "message": message}
        if meta:
            entry["meta"] = meta
        self.entries.append(entry)
        formatted = self.formatter.format(entry)
        for sink in self.sinks:
            try:
                sink.emit(formatted)
            except Exception:
                pass

    def get_logs(self) -> list[dict[str, Any]]:
        return list(self.entries)


def _format_args(args: tuple[Any, ...], kwargs: dict[str, Any]) -> str:
    args_str = ", ".join(repr(a) for a in args)
    kwargs_str = ", ".join(f"{k}={v!r}" for k, v in kwargs.items())
    return ", ".join(filter(None, [args_str, kwargs_str]))


def log(level: LogLevel = LogLevel.INFO, logger: Logger | None = None) -> Callable:
    def decorator(func: Callable) -> Callable:
        actual_logger = logger or Logger()

        if asyncio.iscoroutinefunction(func):
            @functools.wraps(func)
            async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
                func_name = func.__name__
                all_args = _format_args(args, kwargs)
                start_time = time.time()
                try:
                    result = await func(*args, **kwargs)
                    elapsed = time.time() - start_time
                    if level != LogLevel.ERROR:
                        message = f"{func_name}({all_args}) => {result!r} [{elapsed:.3f}s]"
                        actual_logger.log(level, message, func=func_name, elapsed=elapsed)
                    return result
                except Exception as exc:
                    elapsed = time.time() - start_time
                    message = f"{func_name}({all_args}) raised {type(exc).__name__}: {exc} [{elapsed:.3f}s]"
                    actual_logger.log(LogLevel.ERROR, message, func=func_name, error=str(exc), elapsed=elapsed)
                    raise

            return async_wrapper
        else:
            @functools.wraps(func)
            def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
                func_name = func.__name__
                all_args = _format_args(args, kwargs)
                start_time = time.time()
                try:
                    result = func(*args, **kwargs)
                    elapsed = time.time() - start_time
                    if level != LogLevel.ERROR:
                        message = f"{func_name}({all_args}) => {result!r} [{elapsed:.3f}s]"
                        actual_logger.log(level, message, func=func_name, elapsed=elapsed)
                    return result
                except Exception as exc:
                    elapsed = time.time() - start_time
                    message = f"{func_name}({all_args}) raised {type(exc).__name__}: {exc} [{elapsed:.3f}s]"
                    actual_logger.log(LogLevel.ERROR, message, func=func_name, error=str(exc), elapsed=elapsed)
                    raise

            return sync_wrapper

    return decorator


def demo_info_logging_case() -> dict[str, Any]:
    log_file = Path(__file__).resolve().parent / "lab_09.log"
    try:
        log_file.unlink()
    except Exception:
        pass

    logger = Logger(sinks=[ConsoleSink(), FileSink(str(log_file))], formatter=SimpleFormatter())

    @log(level=LogLevel.INFO, logger=logger)
    def add(a: int, b: int) -> int:
        return a + b

    @log(level=LogLevel.DEBUG, logger=logger)
    def multiply(x: int, y: int) -> int:
        return x * y

    add(2, 3)
    multiply(4, 5)

    file_contents = ""
    try:
        file_contents = log_file.read_text(encoding="utf-8")
    except Exception:
        pass

    return {
        "logs": logger.get_logs(),
        "log_count": len(logger.get_logs()),
        "file": str(log_file),
        "file_contents": file_contents,
    }


def demo_error_logging_case() -> dict[str, Any]:
    logger = Logger(sinks=[ConsoleSink()], formatter=SimpleFormatter())

    @log(level=LogLevel.ERROR, logger=logger)
    def divide(a: int, b: int) -> float:
        return a / b

    divide(10, 2)

    try:
        divide(10, 0)
    except ZeroDivisionError:
        pass

    return {
        "logs": logger.get_logs(),
        "error_count": len(logger.get_logs()),
    }


async def demo_async_logging_case() -> dict[str, Any]:
    logger = Logger(sinks=[ExternalSink()], formatter=JSONFormatter())

    @log(level=LogLevel.INFO, logger=logger)
    async def fetch_data(item_id: int) -> str:
        await asyncio.sleep(0.01)
        return f"data-{item_id}"

    @log(level=LogLevel.DEBUG, logger=logger)
    async def process(value: str) -> str:
        await asyncio.sleep(0.005)
        return value.upper()

    result1 = await fetch_data(1)
    result2 = await process(result1)

    return {
        "logs": logger.get_logs(),
        "log_count": len(logger.get_logs()),
        "final_result": result2,
        "external_sent": getattr(logger.sinks[0], "sent", []),
    }


def hello_lab() -> str:
    return "Lab 09: logging decorator ready."
