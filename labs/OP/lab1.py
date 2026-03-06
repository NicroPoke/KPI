import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "fiblib" / "src"))

from kpi_fiblib import consume_with_timeout, fibonacci_generator


if __name__ == "__main__":
	fib_iter = fibonacci_generator()
	iterations = consume_with_timeout(
		fib_iter,
		timeout_seconds=3,
		iteration_delay_seconds=0.3,
	)
	print(f"Finished. Consumed {iterations} values in 3 seconds.")