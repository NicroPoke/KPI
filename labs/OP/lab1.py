import time


def fibonacci_generator():
	first, second = 0, 1
	while True:
		yield first
		first, second = second, first + second


def consume_with_timeout(
	iterator,
	timeout_seconds,
	iteration_delay_seconds=0.2,
):
	if iteration_delay_seconds < 0:
		raise ValueError("iteration_delay_seconds must be >= 0")

	if timeout_seconds <= 0:
		return 0

	deadline = time.monotonic() + timeout_seconds
	consumed_count = 0
	numeric_count = 0
	numeric_total = 0.0

	while time.monotonic() < deadline:
		try:
			value = next(iterator)
		except StopIteration:
			break
		consumed_count += 1

		if isinstance(value, (int, float)):
			numeric_count += 1
			numeric_total += value
			numeric_avg = numeric_total / numeric_count
			print(
				f"#{consumed_count}: {value} | "
				f"total={numeric_total:.2f}, avg={numeric_avg:.2f}"
			)
		else:
			print(f"#{consumed_count}: {value}")

		if iteration_delay_seconds > 0:
			time.sleep(iteration_delay_seconds)

	return consumed_count


if __name__ == "__main__":
	fib_iter = fibonacci_generator()
	iterations = consume_with_timeout(
		fib_iter,
		timeout_seconds=3,
		iteration_delay_seconds=0.3,
	)
	print(f"Finished. Consumed {iterations} values in 3 seconds.")