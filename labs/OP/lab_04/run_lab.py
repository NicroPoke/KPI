import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from library import BiDirectionalPriorityQueue


if __name__ == "__main__":
    queue = BiDirectionalPriorityQueue()

    queue.enqueue("write report", priority=2)
    queue.enqueue("fix production bug", priority=10)
    queue.enqueue("clean inbox", priority=1)
    queue.enqueue("prepare demo", priority=7)

    print("peek highest:", queue.peek(highest=True))
    print("peek lowest:", queue.peek(lowest=True))
    print("peek oldest:", queue.peek(oldest=True))
    print("peek newest:", queue.peek(newest=True))

    print("dequeue highest:", queue.dequeue(highest=True))
    print("dequeue oldest:", queue.dequeue(oldest=True))
    print("items left:", len(queue))