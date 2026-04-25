# Lab 05 - Async Array Function Variants

Task 5 implementation based on one array function: `map`.

Implemented variants:

1. Callback-based async version: `async_map_callback(...)`
	- callback contract is error-first: `callback(err, value)`
2. Promise-like version (Python `Future`): `async_map_promise(...)`
3. Async/await usage over promise variant:
	- `async_map_await(...)`
	- demo with direct `await asyncio.wrap_future(...)`
4. Demo cases for each version: `demo_cases()`
5. Cancellable support with `AbortController` / `AbortSignal`
	- on abort: callback gets `AbortError`, future receives exception
	- abort listeners are removed after completion (cleanup)

## Project structure

- `library/lab_05.py` - main implementation
- `library/__init__.py` - public exports
- `example/main.py` - example runner
- `run_lab.py` - direct lab runner

## Run

From `lab_05` folder:

```bash
python example/main.py
python run_lab.py
```

Expected output includes four demo blocks:

- callback result
- callback abort result (error-first callback receives abort error)
- promise result
- async/await result
- abort result (cancelled)
