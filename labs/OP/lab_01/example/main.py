import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from library.consumers import consume_with_timeout
from library.generators import fibonacci_generator


def main():
    data = fibonacci_generator()
    result = consume_with_timeout(data, timeout_seconds=2, iteration_delay_seconds=0.25)
    print(result)


if __name__ == "__main__":
    main()
