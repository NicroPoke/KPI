from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class Request:
    method: str
    url: str
    headers: dict[str, str]
    body: Any = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "method": self.method,
            "url": self.url,
            "headers": self.headers,
            "body": self.body,
        }


class AuthStrategy(ABC):
    @abstractmethod
    def apply(self, request: Request) -> Request:
        pass


class APIKeyAuthStrategy(AuthStrategy):
    def __init__(self, api_key: str, header_name: str = "X-API-Key") -> None:
        self.api_key = api_key
        self.header_name = header_name

    def apply(self, request: Request) -> Request:
        request.headers[self.header_name] = self.api_key
        return request


class JWTAuthStrategy(AuthStrategy):
    def __init__(self, token: str) -> None:
        self.token = token

    def apply(self, request: Request) -> Request:
        request.headers["Authorization"] = f"Bearer {self.token}"
        return request


class OAuthAuthStrategy(AuthStrategy):
    def __init__(self, access_token: str) -> None:
        self.access_token = access_token

    def apply(self, request: Request) -> Request:
        request.headers["Authorization"] = f"OAuth {self.access_token}"
        return request


class ApiService:
    def __init__(self, base_url: str) -> None:
        self.base_url = base_url
        self.request_log: list[dict[str, Any]] = []

    def handle(self, request: Request) -> dict[str, Any]:
        self.request_log.append(request.to_dict())
        return {
            "status": "ok",
            "service": self.base_url,
            "url": request.url,
            "headers": request.headers,
            "body": request.body,
        }

    def get_log(self) -> list[dict[str, Any]]:
        return self.request_log


class AuthProxy:
    def __init__(self, base_url: str, strategy: AuthStrategy, service: ApiService | None = None) -> None:
        self.base_url = base_url
        self.strategy = strategy
        self.service = service or ApiService(base_url)
        self.request_log: list[dict[str, Any]] = []
        self.monitor: dict[str, int] = {"requests": 0, "forwarded": 0}

    def switch_strategy(self, strategy: AuthStrategy) -> None:
        self.strategy = strategy

    def request(self, method: str, endpoint: str, body: Any = None) -> dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        req = Request(method=method, url=url, headers={}, body=body)
        req = self.strategy.apply(req)
        self.request_log.append(req.to_dict())
        self.monitor["requests"] += 1
        self.monitor["forwarded"] += 1
        response = self.service.handle(req)
        return response

    def get(self, endpoint: str) -> dict[str, Any]:
        return self.request("GET", endpoint)

    def post(self, endpoint: str, body: Any = None) -> dict[str, Any]:
        return self.request("POST", endpoint, body)

    def get_log(self) -> list[dict[str, Any]]:
        return self.request_log

    def get_monitor(self) -> dict[str, int]:
        return dict(self.monitor)


def demo_api_key_case() -> dict[str, Any]:
    strategy = APIKeyAuthStrategy(api_key="secret-key-12345")
    proxy = AuthProxy("https://api.example.com", strategy)

    proxy.get("/users")
    proxy.post("/users", body={"name": "Alice"})

    return {
        "requests": len(proxy.get_log()),
        "last_headers": proxy.get_log()[-1]["headers"],
        "monitor": proxy.get_monitor(),
    }


def demo_jwt_case() -> dict[str, Any]:
    strategy = JWTAuthStrategy(token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")
    proxy = AuthProxy("https://api.example.com", strategy)

    proxy.get("/profile")
    proxy.get("/settings")

    return {
        "requests": len(proxy.get_log()),
        "last_headers": proxy.get_log()[-1]["headers"],
        "monitor": proxy.get_monitor(),
    }


def demo_oauth_case() -> dict[str, Any]:
    strategy = OAuthAuthStrategy(access_token="oauth-token-abc123")
    proxy = AuthProxy("https://api.example.com", strategy)

    proxy.get("/data")
    proxy.post("/data/sync", body={"action": "sync"})

    return {
        "requests": len(proxy.get_log()),
        "first_headers": proxy.get_log()[0]["headers"],
        "monitor": proxy.get_monitor(),
    }


def demo_strategy_switch_case() -> dict[str, Any]:
    proxy = AuthProxy(
        "https://api.example.com",
        APIKeyAuthStrategy(api_key="key-1"),
    )

    first_response = proxy.get("/switch")
    proxy.switch_strategy(JWTAuthStrategy(token="token-2"))
    second_response = proxy.get("/switch")

    return {
        "first_headers": first_response["headers"],
        "second_headers": second_response["headers"],
        "service_log": proxy.service.get_log(),
        "monitor": proxy.get_monitor(),
    }


def hello_lab() -> str:
    return "Lab 08: authentication proxy ready."
