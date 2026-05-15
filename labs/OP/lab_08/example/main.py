import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from library import (
    demo_api_key_case,
    demo_chained_proxies_case,
    demo_jwt_case,
    demo_oauth_case,
    demo_strategy_switch_case,
    hello_lab,
)


def main() -> None:
    print(hello_lab())
    print("api_key:", demo_api_key_case())
    print("jwt:", demo_jwt_case())
    print("oauth:", demo_oauth_case())
    print("switch:", demo_strategy_switch_case())
    print("chained:", demo_chained_proxies_case())


if __name__ == "__main__":
    main()
