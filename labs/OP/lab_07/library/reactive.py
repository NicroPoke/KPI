from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class Subscription:
    emitter: "EventEmitter"
    event_name: str
    callback: Callable[[Any], None]
    active: bool = True

    def unsubscribe(self) -> None:
        if not self.active:
            return
        self.active = False
        self.emitter.off(self.event_name, self.callback)


class EventEmitter:
    def __init__(self) -> None:
        self._listeners: dict[str, list[Callable[[Any], None]]] = {}

    def on(self, event_name: str, callback: Callable[[Any], None]) -> Subscription:
        self._listeners.setdefault(event_name, []).append(callback)
        return Subscription(self, event_name, callback)

    def off(self, event_name: str, callback: Callable[[Any], None]) -> None:
        listeners = self._listeners.get(event_name)
        if not listeners:
            return
        self._listeners[event_name] = [listener for listener in listeners if listener is not callback]
        if not self._listeners[event_name]:
            self._listeners.pop(event_name, None)

    def emit(self, event_name: str, payload: Any = None) -> None:
        callbacks = list(self._listeners.get(event_name, []))
        if not callbacks and event_name != "error":
            self._emit_error({"event": event_name, "message": "no listeners"})
            return
        for callback in callbacks:
            try:
                callback(payload)
            except Exception as exc:
                self._emit_error({"event": event_name, "error": str(exc)})

    def _emit_error(self, error_payload: Any) -> None:
        error_callbacks = list(self._listeners.get("error", []))
        for callback in error_callbacks:
            try:
                callback(error_payload)
            except Exception:
                pass


class Observable:
    def __init__(self, subscribe_fn: Callable[[Callable[[Any], None]], Subscription]) -> None:
        self._subscribe_fn = subscribe_fn

    def subscribe(self, callback: Callable[[Any], None]) -> Subscription:
        return self._subscribe_fn(callback)

    def map(self, transform: Callable[[Any], Any]) -> "Observable":
        def subscribe(callback: Callable[[Any], None]) -> Subscription:
            return self.subscribe(lambda value: callback(transform(value)))

        return Observable(subscribe)


def observe(emitter: EventEmitter, event_name: str) -> Observable:
    return Observable(lambda callback: emitter.on(event_name, callback))


class MessageBus(EventEmitter):
    pass


class Sensor:
    def __init__(self, name: str, bus: MessageBus) -> None:
        self.name = name
        self.bus = bus

    def publish(self, value: int) -> None:
        self.bus.emit("reading", {"source": self.name, "value": value})


class Display:
    def __init__(self, name: str, bus: MessageBus) -> None:
        self.name = name
        self.events: list[str] = []
        self.subscription = bus.on("reading", self._on_reading)

    def _on_reading(self, payload: dict[str, Any]) -> None:
        self.events.append(f"{self.name}:reading:{payload['source']}={payload['value']}")


class AlertPanel:
    def __init__(self, name: str, bus: MessageBus) -> None:
        self.name = name
        self.events: list[str] = []
        self.subscription = bus.on("alert", self._on_alert)

    def _on_alert(self, payload: dict[str, Any]) -> None:
        self.events.append(f"{self.name}:alert:{payload['source']}={payload['value']}")


class AlertRelay:
    def __init__(self, bus: MessageBus, threshold: int) -> None:
        self.bus = bus
        self.threshold = threshold
        self.subscription = bus.on("reading", self._on_reading)

    def _on_reading(self, payload: dict[str, Any]) -> None:
        if payload["value"] >= self.threshold:
            self.bus.emit("alert", {"source": payload["source"], "value": payload["value"]})


def demo_subscription_case() -> dict[str, list[str]]:
    bus = MessageBus()
    events: list[str] = []

    first = bus.on("reading", lambda payload: events.append(f"first:{payload['value']}"))
    bus.on("reading", lambda payload: events.append(f"second:{payload['value']}"))

    sensor = Sensor("temp-sensor", bus)
    sensor.publish(10)
    first.unsubscribe()
    sensor.publish(12)

    return {"events": events}


def demo_reactive_chain_case() -> dict[str, list[str]]:
    bus = MessageBus()
    display = Display("display", bus)
    alert_panel = AlertPanel("alarm", bus)
    relay = AlertRelay(bus, threshold=50)

    sensor = Sensor("room-1", bus)
    sensor.publish(42)
    sensor.publish(55)
    relay.subscription.unsubscribe()
    sensor.publish(70)

    return {
        "display": display.events,
        "alarm": alert_panel.events,
    }


def demo_observable_case() -> dict[str, list[str]]:
    bus = MessageBus()
    readings: list[str] = []

    stream = observe(bus, "reading").map(lambda payload: f"{payload['source']}:{payload['value']}")
    subscription = stream.subscribe(readings.append)

    sensor = Sensor("cpu", bus)
    sensor.publish(25)
    sensor.publish(30)
    subscription.unsubscribe()
    sensor.publish(35)

    return {"readings": readings}


def demo_error_handling_case() -> dict[str, Any]:
    bus = MessageBus()
    working: list[str] = []
    errors: list[str] = []

    def broken_listener(payload: dict[str, Any]) -> None:
        raise RuntimeError("listener crashed")

    def safe_listener(payload: dict[str, Any]) -> None:
        working.append(f"ok:{payload['value']}")

    bus.on("data", broken_listener)
    bus.on("data", safe_listener)
    bus.on("error", lambda err: errors.append(f"caught:{err.get('error')}"))

    bus.emit("data", {"value": 1})
    bus.emit("data", {"value": 2})

    return {
        "working": working,
        "errors": len(errors),
    }


def demo_no_listeners_case() -> dict[str, Any]:
    bus = MessageBus()
    errors: list[str] = []

    bus.on("error", lambda err: errors.append(f"error:{err['message']}"))
    bus.emit("orphan_event", {"data": "test"})
    bus.emit("orphan_event", {"data": "test2"})

    return {
        "error_count": len(errors),
        "error_messages": errors,
    }


def hello_lab() -> str:
    return "Lab 07: reactive communication ready."
