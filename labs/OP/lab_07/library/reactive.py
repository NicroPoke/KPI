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
        for callback in list(self._listeners.get(event_name, [])):
            callback(payload)


class MessageBus(EventEmitter):
    pass


class Sensor:
    def __init__(self, name: str, bus: MessageBus) -> None:
        self.name = name
        self.bus = bus

    def publish(self, value: int) -> None:
        self.bus.emit("reading", {"source": self.name, "value": value})


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
    events: list[str] = []

    bus.on("reading", lambda payload: events.append(f"log:{payload['source']}={payload['value']}"))
    bus.on("alert", lambda payload: events.append(f"alert:{payload['source']}={payload['value']}"))
    relay = AlertRelay(bus, threshold=50)

    sensor = Sensor("room-1", bus)
    sensor.publish(42)
    sensor.publish(55)
    relay.subscription.unsubscribe()
    sensor.publish(70)

    return {"events": events}


def hello_lab() -> str:
    return "Lab 07: reactive communication ready."
