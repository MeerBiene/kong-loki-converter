# Kong Logging Converter

Simple node.js server to convert the json log messages produced by [Kong](https://konghq.com/) and "translate" them into a flat log message that is understood by [Grafana Loki](https://grafana.com/oss/loki/).


<details>
<summary>Kong Log Messages</summary>


```json
{
  "latencies": {
    "request": 515,
    "kong": 58,
    "proxy": 457
  },
  "service": {
    "host": "httpbin.org",
    "created_at": 1614232642,
    "connect_timeout": 60000,
    "id": "167290ee-c682-4ebf-bdea-e49a3ac5e260",
    "protocol": "http",
    "read_timeout": 60000,
    "port": 80,
    "path": "/anything",
    "updated_at": 1614232642,
    "write_timeout": 60000,
    "retries": 5,
    "ws_id": "54baa5a9-23d6-41e0-9c9a-02434b010b25"
  },
  "request": {
    "querystring": {},
    "size": 138,
    "uri": "/log",
    "url": "http://localhost:8000/log",
    "headers": {
      "host": "localhost:8000",
      "accept-encoding": "gzip, deflate",
      "user-agent": "HTTPie/2.4.0",
      "accept": "*/*",
      "connection": "keep-alive"
    },
    "method": "GET"
  },
  "tries": [
    {
      "balancer_latency": 0,
      "port": 80,
      "balancer_start": 1614232668399,
      "ip": "18.211.130.98"
    }
  ],
  "client_ip": "192.168.144.1",
  "workspace": "54baa5a9-23d6-41e0-9c9a-02434b010b25",
  "upstream_uri": "/anything",
  "response": {
    "headers": {
      "content-type": "application/json",
      "date": "Thu, 25 Feb 2021 05:57:48 GMT",
      "connection": "close",
      "access-control-allow-credentials": "true",
      "content-length": "503",
      "server": "gunicorn/19.9.0",
      "via": "kong/2.2.1.0-enterprise-edition",
      "x-kong-proxy-latency": "57",
      "x-kong-upstream-latency": "457",
      "access-control-allow-origin": "*"
    },
    "status": 200,
    "size": 827
  },
  "route": {
    "id": "78f79740-c410-4fd9-a998-d0a60a99dc9b",
    "paths": [
      "/log"
    ],
    "protocols": [
      "http"
    ],
    "strip_path": true,
    "created_at": 1614232648,
    "ws_id": "54baa5a9-23d6-41e0-9c9a-02434b010b25",
    "request_buffering": true,
    "updated_at": 1614232648,
    "preserve_host": false,
    "regex_priority": 0,
    "response_buffering": true,
    "https_redirect_status_code": 426,
    "path_handling": "v0",
    "service": {
      "id": "167290ee-c682-4ebf-bdea-e49a3ac5e260"
    }
  },
  "started_at": 1614232668342
}
```
> Source: https://docs.konghq.com/hub/kong-inc/http-log/#log-format


</details>



<details>
<summary>Loki Log Messages</summary>

```json
{
  "streams": [
    {
      "stream": {
        "label": "value"
      },
      "values": [
          [ "<unix epoch in nanoseconds>", "<log line>" ],
          [ "<unix epoch in nanoseconds>", "<log line>" ]
      ]
    }
  ]
}
```
> Source: https://grafana.com/docs/loki/latest/api/#post-lokiapiv1push


</details>



# Configuration / Environment Variables

| Name                       | Description                                                                                                                                                                                                             | *    |
| :------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--- |
| PORT                       | Port the server listens to. Defaults to 8000                                                                                                                                                                            |      |
| LOKI_HOSTNAME              | Hostname where your loki instance lives                                                                                                                                                                                 | *    |
| LOKI_PATH                  | Loki Path, defaults to "/loki/api/v1/push"                                                                                                                                                                              |      |
| SEPERATOR                  | Seperator to use in the resulting log string, defaults to " = "                                                                                                                                                         |      |
| FLATTENED_OBJECT_SEPERATOR | What to place in between flattened object values. Defaults to "_". Dots (.) do not work well with loki.                                                                                                                 |      |
| LABEL_PROPERTY             | This property is used to label the log messages send to loki. So lets say you want to index your logs by workspace, you would put "workspace" as Label property. Defaults to "workspace". Can be a comma seperated list |      |
| REDACT_PROPERTY            | Properties to exclude in the final log message. Can be a comma seperated list. Defaults to "api_key"                                                                                                                    |      |

`*` =  required