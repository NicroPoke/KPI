# Lab 09 - Logging Decorator

This lab demonstrates a decorator-based logging system with configurable log
levels, support for both sync and async functions, and dependency injection.

## What it does

- Wraps functions with logging decorator.
- Supports configurable log levels (INFO, DEBUG, ERROR).
- Logs function arguments and return values with ISO timestamps.
- Works with both sync and async functions.
- Supports conditional logging (e.g., ERROR level only logs exceptions).
- Accepts a logger instance via dependency injection.

## Run

From the `lab_09` folder:

```bash
python example/main.py
python run_lab.py
```
