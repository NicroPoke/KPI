from functools import wraps
from time import monotonic
from typing import Any, Callable


def memoize(
    *,
    max_size: int | None = None,
    policy: str = "lru",
    ttl_seconds: float | None = None,
    custom_evictor: Callable[[dict[Any, dict[str, Any]]], Any | None] | None = None,
):
    if max_size is not None and max_size < 1:
        raise ValueError("max_size must be None or a positive integer")

    if policy not in {"lru", "lfu", "ttl", "custom"}:
        raise ValueError("policy must be one of: lru, lfu, ttl, custom")

    if ttl_seconds is not None and ttl_seconds <= 0:
        raise ValueError("ttl_seconds must be positive")

    if policy == "ttl" and ttl_seconds is None:
        raise ValueError("ttl_seconds is required when policy='ttl'")

    if policy == "custom" and custom_evictor is None:
        raise ValueError("custom_evictor is required when policy='custom'")

    cache: dict[Any, dict[str, Any]] = {}

    def _make_key(args: tuple[Any, ...], kwargs: dict[str, Any]):
        return (args, tuple(sorted(kwargs.items())))

    def _is_expired(entry: dict[str, Any], now: float) -> bool:
        if policy != "ttl" or ttl_seconds is None:
            return False
        return now - entry["created_at"] >= ttl_seconds

    def _prune_expired(now: float) -> None:
        if policy != "ttl" or ttl_seconds is None:
            return
        expired_keys = [key for key, entry in cache.items() if _is_expired(entry, now)]
        for key in expired_keys:
            cache.pop(key, None)

    def _evict_one() -> None:
        if not cache:
            return

        if policy == "lru":
            key_to_remove = min(cache, key=lambda key: cache[key]["last_access"])
            cache.pop(key_to_remove, None)
            return

        if policy == "lfu":
            key_to_remove = min(
                cache,
                key=lambda key: (cache[key]["access_count"], cache[key]["last_access"]),
            )
            cache.pop(key_to_remove, None)
            return

        if policy == "ttl":
            key_to_remove = min(cache, key=lambda key: cache[key]["created_at"])
            cache.pop(key_to_remove, None)
            return

        eviction_result = custom_evictor(cache) if custom_evictor is not None else None
        if eviction_result is None:
            key_to_remove = min(cache, key=lambda key: cache[key]["last_access"])
            cache.pop(key_to_remove, None)
            return

        if eviction_result in cache:
            cache.pop(eviction_result, None)
            return

        key_to_remove = min(cache, key=lambda key: cache[key]["last_access"])
        cache.pop(key_to_remove, None)

    def decorator(func: Callable[..., Any]):
        @wraps(func)
        def wrapper(*args, **kwargs):
            now = monotonic()
            _prune_expired(now)

            key = _make_key(args, kwargs)
            if key in cache:
                entry = cache[key]
                if _is_expired(entry, now):
                    cache.pop(key, None)
                else:
                    entry["last_access"] = now
                    entry["access_count"] += 1
                    return entry["value"]

            result = func(*args, **kwargs)

            while max_size is not None and len(cache) >= max_size:
                _evict_one()

            cache[key] = {
                "value": result,
                "created_at": now,
                "last_access": now,
                "access_count": 1,
            }
            return result

        return wrapper

    return decorator
