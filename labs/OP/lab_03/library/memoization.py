from functools import wraps


def memoize():
    cache = {}

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = (args, tuple(sorted(kwargs.items())))

            if key in cache:
                return cache[key]

            result = func(*args, **kwargs)
            cache[key] = result

            return result

        return wrapper

    return decorator
