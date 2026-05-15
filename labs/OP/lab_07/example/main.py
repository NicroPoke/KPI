import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from library import (
    demo_error_handling_case,
    demo_no_listeners_case,
    demo_observable_case,
    demo_reactive_chain_case,
    demo_subscription_case,
    hello_lab,
)


def main() -> None:
    print(hello_lab())
    print("subscription:", demo_subscription_case())
    print("observable:", demo_observable_case())
    print("reactive_chain:", demo_reactive_chain_case())
    print("error_handling:", demo_error_handling_case())
    print("no_listeners:", demo_no_listeners_case())


if __name__ == "__main__":
    main()
