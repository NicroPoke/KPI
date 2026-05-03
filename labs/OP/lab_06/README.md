# Lab 06 - Large Data Processing

This lab contains a base pipeline for incremental processing of large datasets
that do not fit in memory.

## What is included

1. Async producer based on `async function*` equivalent (`async def ...: yield`)
2. Incremental consumer that aggregates data without storing all values
3. Event-based stream bridge with explicit `error` event re-throw
4. Demo scenarios for success and producer failure

## Important error-handling rule

- Errors from the async producer are not swallowed.
- For event-based streams, `error` is emitted separately and re-thrown manually
  in the async iterator bridge.

## Files

- library/stream_processing.py - streaming logic
- library/__init__.py - exports
- example/main.py - usage demo
- run_lab.py - direct run

## Run

From the lab_06 folder:

```bash
python example/main.py
python run_lab.py
```
