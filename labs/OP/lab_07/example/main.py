import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from library import demo_reactive_chain_case, demo_subscription_case, hello_lab


def main() -> None:
    print(hello_lab())
    print("subscription:", demo_subscription_case())
    print("reactive_chain:", demo_reactive_chain_case())


if __name__ == "__main__":
    main()
