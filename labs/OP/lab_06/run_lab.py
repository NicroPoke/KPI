import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from library import (
    demo_event_error_case,
    demo_producer_error_case,
    demo_success_case,
    hello_lab,
)


async def main() -> None:
    print(hello_lab())
    print("success:", await demo_success_case())
    print("producer_error:", await demo_producer_error_case())
    print("event_error:", await demo_event_error_case())


if __name__ == "__main__":
    asyncio.run(main())
