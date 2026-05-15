import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from library import demo_api_key_case, demo_jwt_case, demo_oauth_case, demo_strategy_switch_case, hello_lab


if __name__ == "__main__":
    print(hello_lab())
    print("api_key:", demo_api_key_case())
    print("jwt:", demo_jwt_case())
    print("oauth:", demo_oauth_case())
    print("switch:", demo_strategy_switch_case())
