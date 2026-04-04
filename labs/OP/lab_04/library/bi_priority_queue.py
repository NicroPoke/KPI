from typing import Any


class BiDirectionalPriorityQueue:
    def __init__(self) -> None:
        self._items: list[dict[str, Any]] = []
        self._next_order = 0

    def __len__(self) -> int:
        return len(self._items)

    def is_empty(self) -> bool:
        return len(self._items) == 0

    def enqueue(self, item: Any, priority: float) -> None:
        entry = {
            "item": item,
            "priority": priority,
            "order": self._next_order,
        }
        self._next_order += 1
        self._items.append(entry)

    def peek(
        self,
        *,
        highest: bool = False,
        lowest: bool = False,
        oldest: bool = False,
        newest: bool = False,
    ) -> Any:
        index = self._find_index(
            highest=highest,
            lowest=lowest,
            oldest=oldest,
            newest=newest,
        )
        return self._items[index]["item"]

    def dequeue(
        self,
        *,
        highest: bool = False,
        lowest: bool = False,
        oldest: bool = False,
        newest: bool = False,
    ) -> Any:
        index = self._find_index(
            highest=highest,
            lowest=lowest,
            oldest=oldest,
            newest=newest,
        )
        return self._items.pop(index)["item"]

    def _find_index(
        self,
        *,
        highest: bool,
        lowest: bool,
        oldest: bool,
        newest: bool,
    ) -> int:
        if not self._items:
            raise IndexError("Queue is empty")

        mode = self._resolve_mode(
            highest=highest,
            lowest=lowest,
            oldest=oldest,
            newest=newest,
        )
        best_index = 0

        for index in range(1, len(self._items)):
            current = self._items[index]
            best = self._items[best_index]

            if mode == "highest":
                if current["priority"] > best["priority"]:
                    best_index = index
                elif (
                    current["priority"] == best["priority"]
                    and current["order"] < best["order"]
                ):
                    best_index = index
            elif mode == "lowest":
                if current["priority"] < best["priority"]:
                    best_index = index
                elif (
                    current["priority"] == best["priority"]
                    and current["order"] < best["order"]
                ):
                    best_index = index
            elif mode == "oldest":
                if current["order"] < best["order"]:
                    best_index = index
            else:
                if current["order"] > best["order"]:
                    best_index = index

        return best_index

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