// Task 8: Authentication Proxy

var AuthProxy = {
  createProxy: function (config) {
    config = config || {};

    var apiKey = config.apiKey || null;
    var jwtToken = config.jwtToken || null;
    var oauthToken = config.oauthToken || null;

    return {
      setApiKey: function (key) {
        apiKey = key;
      },

      setJWT: function (token) {
        jwtToken = token;
      },

      setOAuthToken: function (token) {
        oauthToken = token;
      },

      request: function (url, options) {
        options = options || {};
        var headers = options.headers || {};

        // Inject API key if present
        if (apiKey) {
          headers["X-API-Key"] = apiKey;
        }

        // Inject JWT if present
        if (jwtToken) {
          headers["Authorization"] = "Bearer " + jwtToken;
        }

        // Inject OAuth token if present
        if (oauthToken) {
          headers["Authorization"] = "Bearer " + oauthToken;
        }

        var fetchOptions = {
          method: options.method || "GET",
          headers: headers,
        };

        if (options.body) {
          fetchOptions.body = options.body;
        }

        return fetch(url, fetchOptions);
      },

      requestJSON: function (url, options) {
        options = options || {};
        options.headers = options.headers || {};
        options.headers["Content-Type"] = "application/json";

        return this.request(url, options).then(function (response) {
          return response.json();
        });
      },

      requestText: function (url, options) {
        return this.request(url, options).then(function (response) {
          return response.text();
        });
      },
    };
  },
};
