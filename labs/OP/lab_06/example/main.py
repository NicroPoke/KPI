import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from library import (
    demo_event_error_case,
    demo_producer_error_case,
    demo_success_case,
    hello_lab,
)


async def main() -> None:
    print(hello_lab())

    success = await demo_success_case()
    print("success:", success)

    producer_error = await demo_producer_error_case()
    print("producer_error:", producer_error)

    event_error = await demo_event_error_case()
    print("event_error:", event_error)


if __name__ == "__main__":
    asyncio.run(main())
