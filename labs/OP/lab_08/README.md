# Lab 08 - Authentication Proxy

This lab demonstrates the Proxy pattern with dependency injection for an
authentication layer in HTTP communication.

## Architecture

Three independent layers with no hard-coded dependencies:

1. **BaseHttpClient** - Base HTTP abstraction, no auth knowledge.
2. **AuthProxyClient** - Implements HttpClient, wraps another HttpClient,
   injects auth headers, and delegates actual requests.
3. **GitHubService** - Consumer that receives HttpClient via constructor.
   Does not import BaseHttpClient or AuthProxyClient directly.

Composition example:
```python
base = BaseHttpClient()
auth = AuthProxyClient(base, JWTAuthStrategy(token))
logging = LoggingProxyClient(auth)
service = GitHubService(logging)
```

## Features

- Multiple auth strategies (API Key, JWT, OAuth).
- Proxy pattern with dependency injection.
- Chaining of multiple proxies (auth → logging).
- Dynamic strategy switching.

## Run

From the `lab_08` folder:

```bash
python example/main.py
python run_lab.py
```
