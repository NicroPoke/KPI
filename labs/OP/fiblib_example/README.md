# kpi-fiblib-example

Example consumer project for the local library dependency `kpi-fiblib`.

## Run

From this directory:

```bash
python -m pip install -r requirements.txt
python main.py
```

## Demonstrated functionality

- Uses `fibonacci_generator()`.
- Uses `consume_with_timeout()` on numeric values.
- Uses `consume_with_timeout()` on non-numeric iterator values.
- Uses zero-timeout behavior.
