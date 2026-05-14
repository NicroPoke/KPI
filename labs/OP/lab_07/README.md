# Lab 07 - Reactive Communication

This lab shows reactive message-based communication between entities using an
EventEmitter-style primitive.

## What it does

- Sends messages through a shared event bus.
- Lets multiple listeners react to the same event independently.
- Lets one entity react to a message and publish a new one.
- Supports subscribe and unsubscribe.
- Also shows an Observable-style view over bus events.

## Run

From the `lab_07` folder:

```bash
python example/main.py
python run_lab.py
```
