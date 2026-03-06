from kpi_fiblib import consume_with_timeout, fibonacci_generator


def word_generator():
    yield "alpha"
    yield "beta"
    yield "gamma"


def main():
    print("Example 1: Fibonacci for 2 seconds")
    fib_iter = fibonacci_generator()
    consumed = consume_with_timeout(
        fib_iter,
        timeout_seconds=2,
        iteration_delay_seconds=0.25,
    )
    print(f"Consumed from Fibonacci: {consumed}")

    print("\nExample 2: Non-numeric iterator")
    consumed_words = consume_with_timeout(
        word_generator(),
        timeout_seconds=2,
        iteration_delay_seconds=0.1,
    )
    print(f"Consumed words: {consumed_words}")

    print("\nExample 3: Zero-timeout behavior")
    consumed_zero = consume_with_timeout(fibonacci_generator(), timeout_seconds=0)
    print(f"Consumed with zero timeout: {consumed_zero}")


if __name__ == "__main__":
    main()
