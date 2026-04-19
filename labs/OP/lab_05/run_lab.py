import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from library import demo_progress, hello_lab


if __name__ == "__main__":
    print(hello_lab())
    print("Demo snapshot:", demo_progress())
