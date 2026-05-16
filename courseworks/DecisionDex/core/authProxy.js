function Request(method, url, headers, body) {
  this.method = method;
  this.url = url;
  this.headers = headers || {};
  this.body = body == null ? null : body;
}
Request.prototype.toDict = function () {
  return {
    method: this.method,
    url: this.url,
    headers: this.headers,
    body: this.body,
  };
};

function Response(status, headers, body) {
  this.status = status;
  this.headers = headers || {};
  this.body = body == null ? null : body;
}
Response.prototype.toDict = function () {
  return {
    status: this.status,
    headers: this.headers,
    body: this.body,
  };
};

function BaseHttpClient() {
  this.requestLog = [];
}
BaseHttpClient.prototype.request = function (request) {
  this.requestLog.push(request.toDict());
  return new Response(200, Object.assign({}, request.headers), { success: true });
};
BaseHttpClient.prototype.getLog = function () {
  return this.requestLog;
};

function APIKeyAuthStrategy(apiKey, headerName) {
  this.apiKey = apiKey;
  this.headerName = headerName || "X-API-Key";
}
APIKeyAuthStrategy.prototype.apply = function (request) {
  request.headers[this.headerName] = this.apiKey;
  return request;
};

function JWTAuthStrategy(token) {
  this.token = token;
}
JWTAuthStrategy.prototype.apply = function (request) {
  request.headers.Authorization = "Bearer " + this.token;
  return request;
};

function OAuthAuthStrategy(accessToken) {
  this.accessToken = accessToken;
}
OAuthAuthStrategy.prototype.apply = function (request) {
  request.headers.Authorization = "OAuth " + this.accessToken;
  return request;
};

function AuthProxyClient(innerClient, strategy) {
  this.innerClient = innerClient;
  this.strategy = strategy;
  this.log = [];
}
AuthProxyClient.prototype.request = function (request) {
  request = this.strategy.apply(request);
  this.log.push(request.toDict());
  return this.innerClient.request(request);
};
AuthProxyClient.prototype.switchStrategy = function (strategy) {
  this.strategy = strategy;
};
AuthProxyClient.prototype.getLog = function () {
  return this.log;
};

function LoggingProxyClient(innerClient) {
  this.innerClient = innerClient;
  this.log = [];
}
LoggingProxyClient.prototype.request = function (request) {
  this.log.push({ request: request.toDict(), timestamp: "now" });
  return this.innerClient.request(request);
};
LoggingProxyClient.prototype.getLog = function () {
  return this.log;
};

function GitHubService(httpClient) {
  this.httpClient = httpClient;
}
GitHubService.prototype.getUser = function (username) {
  var request = new Request("GET", "https://api.github.com/users/" + username, {});
  return this.httpClient.request(request);
};
GitHubService.prototype.createRepo = function (repoName) {
  var request = new Request("POST", "https://api.github.com/user/repos", { "Content-Type": "application/json" }, { name: repoName });
  return this.httpClient.request(request);
};

var AuthProxy = {
  Request: Request,
  Response: Response,
  BaseHttpClient: BaseHttpClient,
  APIKeyAuthStrategy: APIKeyAuthStrategy,
  JWTAuthStrategy: JWTAuthStrategy,
  OAuthAuthStrategy: OAuthAuthStrategy,
  AuthProxyClient: AuthProxyClient,
  LoggingProxyClient: LoggingProxyClient,
  GitHubService: GitHubService,
};
