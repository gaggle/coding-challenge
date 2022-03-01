Run `yarn dev` to start both services:
```shell
$ yarn dev
[dev:worker     ] Microservice is listening
[dev:data-stream] [Nest] 42852  - 03/03/2022, 10:43:55 PM     LOG [NestApplication] Nest application successfully started +38ms
```

To instruct DataStreams to start Worker to fetch data, run this GraphQL mutation:
```shell
$ curl 'http://localhost:3000/graphql' -H 'Content-Type: application/json' --data-binary '{"query":"mutation StartWorker { startFetchingData(frequencyMs: 300000) { interval state }}"}' | jq
{
  "data": {
    "startFetchingData": {
      "interval": 300000,
      "state": "running"
    }
  }
}
```

The worker now fetches data every 5 minutes. This can be seen in the debug output, and by getting data from DataStreams:
```shell
$ curl 'http://localhost:3000/graphql' -H 'Content-Type: application/json' --data-binary '{"query":"query GetData { getData { data { measurement_created, request_time, source_title, wind_direction }}}"}' | jq
{
  "data": {
    "getData": {
      "data": [
        {
          "measurement_created": "2022-03-03T20:02:43.448041Z",
          "request_time": "2022-03-03T22:44:25.552920+01:00",
          "source_title": "BBC",
          "wind_direction": "NNE"
        }
      ]
    }
  }
}
```

To stop the worker:
```shell
$ curl 'http://localhost:3000/graphql' -H 'Content-Type: application/json' --data-binary '{"query":"mutation StopWorker { stopFetchingData { state }}"}'                   
{"data":{"stopFetchingData":{"state":"stopped"}}}
```

The GraphQL playground is available at [http://localhost:3000/graphql](http://localhost:3000/graphql).

---

### Some thoughts…

This was the first time I tried GraphQL, so I found it difficult to know how much implementation I could hand-wave away as details and how much was important to build 😅.

I chose an in-memory "storage" for DataStreams for simplicity's sake, but it could easily be a proper DB and the data-getting endpoint enhanced to support filtering, pagination, etc.

Likewise, the Worker's internal fetching is a simple `setInterval` timer to not get dragged into more complex patterns, but it leaves the fetching brittle and without error handling. A more resilient solution could be a Worker based on an event-driven architecture.

There are also numerous issues to discuss in the server-to-service communication: What if a request goes missing? What if the Worker generates errors? 

The internal microservice-communication is TCP-based just to keep things light, and I didn't solve for shared types so there is a lot of type-duplication across services (I've been happy with gRPC before, in part because they offer great types that can be shared from a single source of truth, but I felt that'd overcomplicate things even more than they are now).

Then there's the issue of Nest, and the role it should play in a tech stack. I like parts of Nest just fine, but if I'm not careful its dependency-injected decorators sneak into every bit of code, adding complexity to areas that don't need it. For example, I think there are good arguments for keeping fetching and logging Nest-free.

Anyway, lots to discuss.
