import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from library import demo_observable_case, demo_reactive_chain_case, demo_subscription_case, hello_lab


if __name__ == "__main__":
    print(hello_lab())
    print("subscription:", demo_subscription_case())
    print("observable:", demo_observable_case())
    print("reactive_chain:", demo_reactive_chain_case())
