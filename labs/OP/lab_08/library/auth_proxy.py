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


class AuthProxy:
    def __init__(self, base_url: str, strategy: AuthStrategy) -> None:
        self.base_url = base_url
        self.strategy = strategy
        self.request_log: list[dict[str, Any]] = []

    def request(self, method: str, endpoint: str, body: Any = None) -> dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        req = Request(method=method, url=url, headers={}, body=body)
        req = self.strategy.apply(req)
        self.request_log.append(req.to_dict())
        return {
            "status": "sent",
            "url": req.url,
            "headers": req.headers,
        }

    def get(self, endpoint: str) -> dict[str, Any]:
        return self.request("GET", endpoint)

    def post(self, endpoint: str, body: Any = None) -> dict[str, Any]:
        return self.request("POST", endpoint, body)

    def get_log(self) -> list[dict[str, Any]]:
        return self.request_log


def demo_api_key_case() -> dict[str, Any]:
    strategy = APIKeyAuthStrategy(api_key="secret-key-12345")
    proxy = AuthProxy("https://api.example.com", strategy)

    proxy.get("/users")
    proxy.post("/users", body={"name": "Alice"})

    return {
        "requests": len(proxy.get_log()),
        "last_headers": proxy.get_log()[-1]["headers"],
    }


def demo_jwt_case() -> dict[str, Any]:
    strategy = JWTAuthStrategy(token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")
    proxy = AuthProxy("https://api.example.com", strategy)

    proxy.get("/profile")
    proxy.get("/settings")

    return {
        "requests": len(proxy.get_log()),
        "last_headers": proxy.get_log()[-1]["headers"],
    }


def demo_oauth_case() -> dict[str, Any]:
    strategy = OAuthAuthStrategy(access_token="oauth-token-abc123")
    proxy = AuthProxy("https://api.example.com", strategy)

    proxy.get("/data")
    proxy.post("/data/sync", body={"action": "sync"})

    return {
        "requests": len(proxy.get_log()),
        "first_headers": proxy.get_log()[0]["headers"],
    }


def hello_lab() -> str:
    return "Lab 08: authentication proxy ready."
