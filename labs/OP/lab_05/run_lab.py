import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from library import demo_cases, hello_lab


if __name__ == "__main__":
    print(hello_lab())
    print("Demo cases:", demo_cases())
