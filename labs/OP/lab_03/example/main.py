import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from library import memoize


@memoize()
def fibonacci(n: int) -> int:
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


def main():
    for index in [30, 31, 32, 33]:
        print(f"fib({index}) = {fibonacci(index)}")


if __name__ == "__main__":
    main()
