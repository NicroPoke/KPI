import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from library import demo_progress, hello_lab


def main():
    print(hello_lab())
    print("Demo snapshot:", demo_progress())


if __name__ == "__main__":
    main()
