import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from library import memoize


@memoize()
def power(base: int, exponent: int) -> int:
    if exponent == 0:
        return 1
    return base * power(base, exponent - 1)


if __name__ == "__main__":
    print("2^10 =", power(2, 10))
    print("3^7 =", power(3, 7))
    print("2^10 (cached) =", power(2, 10))
