from collections import deque
from heapq import heappop, heappush
from typing import Any


class BiDirectionalPriorityQueue:
    def __init__(self) -> None:
        self._data: dict[int, tuple[Any, float]] = {}
        self._alive: set[int] = set()
        self._orders: deque[int] = deque()
        self._min_heap: list[tuple[float, int]] = []
        self._max_heap: list[tuple[float, int]] = []
        self._order_counter = 0

    def __len__(self) -> int:
        return len(self._alive)

    def is_empty(self) -> bool:
        return len(self) == 0

    def enqueue(self, item: Any, priority: float) -> None:
        order = self._order_counter
        self._order_counter += 1

        self._data[order] = (item, priority)
        self._alive.add(order)
        self._orders.append(order)
        heappush(self._min_heap, (priority, order))
        heappush(self._max_heap, (-priority, order))

    def peek(
        self,
        *,
        highest: bool = False,
        lowest: bool = False,
        oldest: bool = False,
        newest: bool = False,
    ) -> Any:
        order = self._find_order(
            highest=highest,
            lowest=lowest,
            oldest=oldest,
            newest=newest,
        )
        item, _ = self._data[order]
        return item

    def dequeue(
        self,
        *,
        highest: bool = False,
        lowest: bool = False,
        oldest: bool = False,
        newest: bool = False,
    ) -> Any:
        order = self._find_order(
            highest=highest,
            lowest=lowest,
            oldest=oldest,
            newest=newest,
        )
        item, _ = self._data.pop(order)
        self._alive.remove(order)
        return item

    def _find_order(
        self,
        *,
        highest: bool,
        lowest: bool,
        oldest: bool,
        newest: bool,
    ) -> int:
        if self.is_empty():
            raise IndexError("Queue is empty")

        mode = self._resolve_mode(
            highest=highest,
            lowest=lowest,
            oldest=oldest,
            newest=newest,
        )

        if mode == "highest":
            self._cleanup_priority_heap(self._max_heap)
            _, order = self._max_heap[0]
            return order

        if mode == "lowest":
            self._cleanup_priority_heap(self._min_heap)
            _, order = self._min_heap[0]
            return order

        if mode == "oldest":
            self._cleanup_order_queue(front=True)
            return self._orders[0]

        self._cleanup_order_queue(front=False)
        return self._orders[-1]

    def _cleanup_priority_heap(self, heap: list[tuple[float, int]]) -> None:
        while heap and heap[0][1] not in self._alive:
            heappop(heap)

    def _cleanup_order_queue(self, *, front: bool) -> None:
        while self._orders:
            candidate = self._orders[0] if front else self._orders[-1]
            if candidate in self._alive:
                return
            if front:
                self._orders.popleft()
            else:
                self._orders.pop()

    @staticmethod
    def _resolve_mode(
        *,
        highest: bool,
        lowest: bool,
        oldest: bool,
        newest: bool,
    ) -> str:
        selected = [
            name
            for name, enabled in (
                ("highest", highest),
                ("lowest", lowest),
                ("oldest", oldest),
                ("newest", newest),
            )
            if enabled
        ]

        if len(selected) > 1:
            raise ValueError("Choose exactly one mode: highest/lowest/oldest/newest")

        if len(selected) == 1:
            return selected[0]

        return "highest"