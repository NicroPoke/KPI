import unittest

from library import BiDirectionalPriorityQueue


class BiDirectionalPriorityQueueTests(unittest.TestCase):
    def setUp(self) -> None:
        self.queue = BiDirectionalPriorityQueue()

    def _fill_default_items(self) -> None:
        self.queue.enqueue("A", priority=3)
        self.queue.enqueue("B", priority=10)
        self.queue.enqueue("C", priority=1)
        self.queue.enqueue("D", priority=7)

    def test_enqueue_and_len(self) -> None:
        self.assertTrue(self.queue.is_empty())
        self.queue.enqueue("task", priority=5)
        self.assertEqual(len(self.queue), 1)
        self.assertFalse(self.queue.is_empty())

    def test_peek_modes(self) -> None:
        self._fill_default_items()

        self.assertEqual(self.queue.peek(highest=True), "B")
        self.assertEqual(self.queue.peek(lowest=True), "C")
        self.assertEqual(self.queue.peek(oldest=True), "A")
        self.assertEqual(self.queue.peek(newest=True), "D")

    def test_dequeue_modes(self) -> None:
        self._fill_default_items()

        self.assertEqual(self.queue.dequeue(highest=True), "B")
        self.assertEqual(self.queue.dequeue(lowest=True), "C")
        self.assertEqual(self.queue.dequeue(oldest=True), "A")
        self.assertEqual(self.queue.dequeue(newest=True), "D")
        self.assertTrue(self.queue.is_empty())

    def test_default_mode_is_highest(self) -> None:
        self._fill_default_items()
        self.assertEqual(self.queue.peek(), "B")
        self.assertEqual(self.queue.dequeue(), "B")

    def test_priority_tie_breaks_by_oldest(self) -> None:
        self.queue.enqueue("first", priority=5)
        self.queue.enqueue("second", priority=5)
        self.queue.enqueue("third", priority=5)

        self.assertEqual(self.queue.peek(highest=True), "first")
        self.assertEqual(self.queue.dequeue(highest=True), "first")
        self.assertEqual(self.queue.dequeue(lowest=True), "second")

    def test_peek_does_not_remove(self) -> None:
        self._fill_default_items()
        value = self.queue.peek(lowest=True)
        self.assertEqual(value, "C")
        self.assertEqual(len(self.queue), 4)

    def test_empty_queue_raises_index_error(self) -> None:
        with self.assertRaises(IndexError):
            self.queue.peek(highest=True)

        with self.assertRaises(IndexError):
            self.queue.dequeue(newest=True)

    def test_multiple_modes_raise_value_error(self) -> None:
        self.queue.enqueue("x", priority=1)

        with self.assertRaises(ValueError):
            self.queue.peek(highest=True, lowest=True)

        with self.assertRaises(ValueError):
            self.queue.dequeue(oldest=True, newest=True)


if __name__ == "__main__":
    unittest.main()
