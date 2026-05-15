import asyncio
import functools
import inspect
import time
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Callable


class LogLevel(Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    ERROR = "ERROR"


class Logger:
    def __init__(self) -> None:
        self.messages: list[dict[str, Any]] = []

    def log(self, level: LogLevel, message: str) -> None:
        timestamp = datetime.now(timezone.utc).isoformat()
        entry = {
            "timestamp": timestamp,
            "level": level.value,
            "message": message,
        }
        self.messages.append(entry)

    def get_logs(self) -> list[dict[str, Any]]:
        return self.messages


def log(
    level: LogLevel = LogLevel.INFO,
    logger: Logger | None = None,
) -> Callable:
    def decorator(func: Callable) -> Callable:
        actual_logger = logger or Logger()

        if asyncio.iscoroutinefunction(func):
            @functools.wraps(func)
            async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
                func_name = func.__name__
                args_str = repr(args)[1:-1] if args else ""
                kwargs_str = ", ".join(f"{k}={v!r}" for k, v in kwargs.items())
                all_args = ", ".join(filter(None, [args_str, kwargs_str]))

                start_time = time.time()
                try:
                    result = await func(*args, **kwargs)
                    elapsed = time.time() - start_time

                    if level == LogLevel.ERROR:
                        return result

                    message = f"{func_name}({all_args}) => {result!r} [{elapsed:.3f}s]"
                    actual_logger.log(level, message)
                    return result
                except Exception as exc:
                    elapsed = time.time() - start_time
                    message = f"{func_name}({all_args}) raised {type(exc).__name__}: {exc} [{elapsed:.3f}s]"
                    actual_logger.log(LogLevel.ERROR, message)
                    raise

            return async_wrapper
        else:
            @functools.wraps(func)
            def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
                func_name = func.__name__
                args_str = repr(args)[1:-1] if args else ""
                kwargs_str = ", ".join(f"{k}={v!r}" for k, v in kwargs.items())
                all_args = ", ".join(filter(None, [args_str, kwargs_str]))

                start_time = time.time()
                try:
                    result = func(*args, **kwargs)
                    elapsed = time.time() - start_time

                    if level == LogLevel.ERROR:
                        return result

                    message = f"{func_name}({all_args}) => {result!r} [{elapsed:.3f}s]"
                    actual_logger.log(level, message)
                    return result
                except Exception as exc:
                    elapsed = time.time() - start_time
                    message = f"{func_name}({all_args}) raised {type(exc).__name__}: {exc} [{elapsed:.3f}s]"
                    actual_logger.log(LogLevel.ERROR, message)
                    raise

            return sync_wrapper

    return decorator


def demo_info_logging_case() -> dict[str, Any]:
    logger = Logger()

    @log(level=LogLevel.INFO, logger=logger)
    def add(a: int, b: int) -> int:
        return a + b

    @log(level=LogLevel.DEBUG, logger=logger)
    def multiply(x: int, y: int) -> int:
        return x * y

    add(2, 3)
    multiply(4, 5)

    return {
        "logs": logger.get_logs(),
        "log_count": len(logger.get_logs()),
    }


def demo_error_logging_case() -> dict[str, Any]:
    logger = Logger()

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
    logger = Logger()

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
    }


def hello_lab() -> str:
    return "Lab 09: logging decorator ready."
