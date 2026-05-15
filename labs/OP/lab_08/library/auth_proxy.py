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


@dataclass(slots=True)
class Response:
    status: int
    headers: dict[str, str]
    body: Any = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "status": self.status,
            "headers": self.headers,
            "body": self.body,
        }


class HttpClient(ABC):
    @abstractmethod
    def request(self, request: Request) -> Response:
        pass


class BaseHttpClient(HttpClient):
    def __init__(self) -> None:
        self.request_log: list[dict[str, Any]] = []

    def request(self, request: Request) -> Response:
        self.request_log.append(request.to_dict())
        return Response(
            status=200,
            headers=request.headers.copy(),
            body={"success": True},
        )

    def get_log(self) -> list[dict[str, Any]]:
        return self.request_log


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


class AuthProxyClient(HttpClient):
    def __init__(self, inner_client: HttpClient, strategy: AuthStrategy) -> None:
        self.inner_client = inner_client
        self.strategy = strategy
        self.log: list[dict[str, Any]] = []

    def request(self, request: Request) -> Response:
        request = self.strategy.apply(request)
        self.log.append(request.to_dict())
        return self.inner_client.request(request)

    def switch_strategy(self, strategy: AuthStrategy) -> None:
        self.strategy = strategy

    def get_log(self) -> list[dict[str, Any]]:
        return self.log


class LoggingProxyClient(HttpClient):
    def __init__(self, inner_client: HttpClient) -> None:
        self.inner_client = inner_client
        self.log: list[dict[str, Any]] = []

    def request(self, request: Request) -> Response:
        self.log.append({
            "request": request.to_dict(),
            "timestamp": "now",
        })
        return self.inner_client.request(request)

    def get_log(self) -> list[dict[str, Any]]:
        return self.log


class GitHubService:
    def __init__(self, http_client: HttpClient) -> None:
        self.http_client = http_client

    def get_user(self, username: str) -> Response:
        request = Request(
            method="GET",
            url=f"https://api.github.com/users/{username}",
            headers={},
        )
        return self.http_client.request(request)

    def create_repo(self, repo_name: str) -> Response:
        request = Request(
            method="POST",
            url="https://api.github.com/user/repos",
            headers={"Content-Type": "application/json"},
            body={"name": repo_name},
        )
        return self.http_client.request(request)


def demo_api_key_case() -> dict[str, Any]:
    base_client = BaseHttpClient()
    auth_client = AuthProxyClient(base_client, APIKeyAuthStrategy(api_key="secret-key-123"))

    service = GitHubService(auth_client)
    service.get_user("octocat")
    service.create_repo("new-repo")

    return {
        "requests": len(auth_client.get_log()),
        "last_headers": auth_client.get_log()[-1]["headers"],
        "base_logged": len(base_client.get_log()),
    }


def demo_jwt_case() -> dict[str, Any]:
    base_client = BaseHttpClient()
    auth_client = AuthProxyClient(base_client, JWTAuthStrategy(token="jwt-token-abc"))

    service = GitHubService(auth_client)
    service.get_user("user1")
    service.get_user("user2")

    return {
        "requests": len(auth_client.get_log()),
        "auth_headers": [req.get("headers", {}).get("Authorization") for req in auth_client.get_log()],
    }


def demo_oauth_case() -> dict[str, Any]:
    base_client = BaseHttpClient()
    auth_client = AuthProxyClient(base_client, OAuthAuthStrategy(access_token="oauth-token-xyz"))

    service = GitHubService(auth_client)
    service.create_repo("oauth-repo")

    return {
        "requests": len(auth_client.get_log()),
        "auth_method": auth_client.get_log()[0]["headers"].get("Authorization", "").split()[0],
    }


def demo_strategy_switch_case() -> dict[str, Any]:
    base_client = BaseHttpClient()
    auth_client = AuthProxyClient(base_client, APIKeyAuthStrategy(api_key="key-1"))

    service = GitHubService(auth_client)
    service.get_user("user1")

    auth_client.switch_strategy(JWTAuthStrategy(token="token-2"))
    service.get_user("user2")

    return {
        "first_auth": auth_client.get_log()[0]["headers"].get("X-API-Key"),
        "second_auth": auth_client.get_log()[1]["headers"].get("Authorization"),
    }


def demo_chained_proxies_case() -> dict[str, Any]:
    base_client = BaseHttpClient()
    auth_client = AuthProxyClient(base_client, JWTAuthStrategy(token="token"))
    logging_client = LoggingProxyClient(auth_client)

    service = GitHubService(logging_client)
    service.get_user("test-user")
    service.create_repo("test-repo")

    return {
        "logging_count": len(logging_client.get_log()),
        "auth_count": len(auth_client.get_log()),
        "base_count": len(base_client.get_log()),
    }


def hello_lab() -> str:
    return "Lab 08: authentication proxy ready."
