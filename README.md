# Talis CDK8s constructs

A Talis library of [CDK8s](https://cdk8s.io/docs/latest/) constructs for Kubernetes-orchestrated apps, implemented in Typescript.

## Contributing

This project follows [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/), and enforces this choice during the build and release cycle.

Builds are conducted by CircleCI, and upon successful build of the `main` branch, [`semantic-release`](https://semantic-release.gitbook.io/semantic-release/) will generate a new release, an appropriate version (based on commits), and release-notes to cover the content of the commit log.

For tests, this project uses [`vitest`](https://vitest.dev/).

## Available constructs

- `BackgroundWorker`

  - Represents a background worker that runs continuously, reads messages from a queue, and processes them.
  - Applied as a simple Deployment.
  - Supports setting a custom stop signal to allow for graceful termination.
  - Details in an [example](./examples/background-worker/README.md).

- `ConfigMap`

  - Represents a Kubernetes ConfigMap.
  - Supports setting a key/value from a file.
  - Supports loading keys/values from a .env file.
  - Supports setting binary data.
  - Example use can be found in [WebService advanced example](./examples/advanced-web-service/README.md).

- `CronJob`

  - Represents a Cron Job that is run based on a schedule.
  - Supports setting the Schedule.
  - The command to run is defined as part of the container spec.
  - Details in an [example](./examples/cron-job/README.md).

- `Job`

  - Represents a single run Job.
  - The command to run is defined as part of the container spec.
  - Details in an [example](./examples/job/README.md).

- `Memcached`

  - Represents a standalone singe node Memcached server.
  - Supports setting the version of Memcached you wish to run.
  - Details in an [example](./examples/memcached/README.md).

- `Mongo`

  - Represents a standalone single node Mongo server.
  - The command to run is defined as part of the container spec.
  - Supports setting the version of Mongo you wish to run.
  - Supports setting the storageEngine.
  - Details in an [example](./examples/mongo/README.md).

- `Postgres`

  - Represents a standalone single node Postgres server.
  - Supports setting the version of Postgres you wish to run.
  - Supports setting initContainers and volumes to run init scripts.
  - Details in an [example](./examples/postgres/README.md).

- `Redis`

  - Represents a standalone singe node Redis server.
  - The command to run is defined as part of the container spec.
  - Supports setting the version of redis you wish to run.
  - Uses the default redis-server config.
  - Details in an [example](./examples/redis/README.md).

- `Secret`

  - Represents a Kubernetes Secret.
  - Encodes data in base64.
  - Supports setting a key/value from a file.
  - Supports loading keys/values from a .env file.
  - Supports setting string data, allowing Kubernetes API to encode on write.

- `TalisChart`

  - A convenience class for creating a Chart and ensuring standard Talis labels are added.
  - Creates a namespace based on the app name.
  - Supports watermarks, e.g. for on-demand environments.
  - Showcased in [AdvancedWebServiceChart](./examples/advanced-web-service/chart.ts) and [BackgroundWorkerChart](./examples/background-worker/chart.ts).

- `WebService`

  - Represents a web application exposed via an AWS Application Load Balancer.
  - Supports autoscaling.
  - Supports adding Nginx reverse proxy.
  - Supports canary releases with a separate canary deployment and load balancer, allowing to test the new version via host hack.
  - Details in a [simple](./examples/simple-web-service/README.md) and [advanced](./examples/advanced-web-service/README.md) examples.

## Available utilities

- `convertToStringList` - Stringify given list as stringList: `s1,s2,s3` to be used as Ingress annotation.
- `convertToStringMap` - Stringify given object as stringMap: `k1=v1,k2=v2` to be used as Ingress annotation.
- `convertToJsonContent` - Stringify given object as JSON: `{"k1":"v1","k2":"v2"}` to be used as Ingress annotation.
- `createDockerHubSecretFromEnv` - Creates a secret with auth credentials for pulling images from Docker Hub.
- `createImagePullSecret` - Creates a secret with auth credentials for pulling images from a private registry.
- `getCanaryStage` - Gets the stage of a canary deployment from an environment variable, and validates its value.
- `getDockerTag` - Gets the Docker tag from an environment variable, and validates its value.
- `getWatermark` - Gets the watermark from an environment variable.
- `getTtlTimestamp` - Gets the TTL timestamp from an environment variable.
- `getEksDashboardUrl` - Builds the URL of the Kubernetes dashboard for a given cluster and namespace.
- `getGraphsUrl` - Builds the URL of the Grafana workload dashboard for a given cluster and namespace.
- `getLogsUrl` - Builds the URL of the Grafana logs dashboard for a given cluster and app.
- `nginxUtil.createConfigMap` - Creates a ConfigMap for Nginx reverse proxy, with optional default configuration; The ConfigMap can be used with `WebService`'s `nginx.configMap` property.
- `nginxUtil.getDefaultConfig` - Returns the default Nginx reverse proxy configuration to expose the application on the specified port; Output of this function is used with `createConfigMap` with `includeDefaultConfig` enabled.
- `nginxUtil.getSameSiteCookiesConfig` - Return the Nginx configuration that patches `Set-Cookie` headers to use the `SameSite` attribute; Output of this function is used with `createConfigMap` with `includeSameSiteCookiesConfig` enabled.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run lint` will check code quality and style guidelines (using ESlint and Prettier)
- `npm run format` will format the code (using Prettier)
- `npm run test` run tests
- `npm run test -- --update` update the test snapshots
- `npm run coverage` run tests and calculate coverage
