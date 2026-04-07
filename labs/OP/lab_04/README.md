# Lab 04 — Bi-Directional Priority Queue

Python laboratory work.

## Implemented

- `enqueue(item, priority)`
- `peek(...)` with modes `highest`, `lowest`, `oldest`, `newest`
- `dequeue(...)` with modes `highest`, `lowest`, `oldest`, `newest`
- Tie-breaking for equal priorities uses FIFO (oldest first)
- Empty queue access raises `IndexError`
- Passing more than one mode raises `ValueError`

If no mode is specified, `highest` is used.

## Structure

- `library/` — queue implementation
- `example/main.py` — short usage example
- `run_lab.py` — lab run script

## Run

From the `lab_04` folder:

```bash
python example/main.py
python run_lab.py
python -m unittest discover -s tests -p "test_*.py"
```