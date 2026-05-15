import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from library import (
    demo_async_logging_case,
    demo_error_logging_case,
    demo_info_logging_case,
    hello_lab,
)


def main() -> None:
    print(hello_lab())
    print("info:", demo_info_logging_case())
    print("error:", demo_error_logging_case())
    print("async:", asyncio.run(demo_async_logging_case()))


if __name__ == "__main__":
    main()
