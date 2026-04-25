# Lab 05 - Async map

In this lab, map is implemented in three async styles.

## What is included

1. Callback version: async_map_callback(...)
2. Future version: async_map_promise(...)
3. Async/await version: async_map_await(...)
4. Demo examples: demo_cases()
5. Cancel support via AbortController and AbortSignal

If operation is cancelled:
- callback receives AbortError
- Future completes with exception

## Files

- library/lab_05.py - main logic
- library/__init__.py - exports
- example/main.py - demo run
- run_lab.py - direct run

## Run

From the lab_05 folder:

```bash
python example/main.py
python run_lab.py
```

## Expected output

- callback result
- callback abort result
- promise result
- async/await result
- abort result (cancelled)
