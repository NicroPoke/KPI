import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from library import BiDirectionalPriorityQueue


def main():
    queue = BiDirectionalPriorityQueue()
    queue.enqueue("task-A", priority=3)
    queue.enqueue("task-B", priority=10)
    queue.enqueue("task-C", priority=1)

    print("highest:", queue.peek(highest=True))
    print("lowest:", queue.peek(lowest=True))
    print("oldest:", queue.peek(oldest=True))
    print("newest:", queue.peek(newest=True))


if __name__ == "__main__":
    main()