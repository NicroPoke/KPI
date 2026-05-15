# Lab 08 - Authentication Proxy

This lab shows how to implement an authentication proxy that intercepts HTTP
requests and injects authentication credentials.

## What it does

- Wraps HTTP requests with an interceptor/proxy layer.
- Injects authentication headers before forwarding requests.
- Supports multiple authentication methods: API Key, JWT, OAuth.
- Provides a proxy interface for protected API calls.
- Demonstrates request interception and credential injection.
- Logs proxied requests and service-side deliveries.
- Supports dynamic switching between authentication strategies.

## Run

From the `lab_08` folder:

```bash
python example/main.py
python run_lab.py
```
