# Lab 06 - Large Data Processing

This lab shows how to process large data step by step, without loading the
whole dataset into memory.

## What it does

- Generates data with an async stream.
- Processes batches one by one and keeps only summary values in memory.
- Shows the same idea with an event-based stream.
- Keeps producer errors visible, so they do not turn into a silent `done: true`.

## Run

From the `lab_06` folder:

```bash
python example/main.py
python run_lab.py
```
