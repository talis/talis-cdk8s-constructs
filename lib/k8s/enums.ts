/**
 * Image pull policy.
 *
 * @see https://kubernetes.io/docs/concepts/containers/images#updating-images
 * @default "Always" if :latest tag is specified, or "IfNotPresent" otherwise.
 */
export enum ContainerImagePullPolicy {
  /**
   * Always means that kubelet always attempts to pull the latest image.
   * Container will fail If the pull fails.
   */
  ALWAYS = "Always",
  /**
   * IfNotPresent means that kubelet pulls if the image isn't present on disk.
   * Container will fail if the image isn't present and the pull fails.
   */
  IF_NOT_PRESENT = "IfNotPresent",
  /**
   * Never means that kubelet never pulls an image, but only uses a local image.
   * Container will fail if the image isn't present.
   */
  NEVER = "Never",
}

/**
 * Restart policy for all containers within the pod.
 *
 * @see https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#restart-policy
 * @default "Always"
 */
export enum PodSpecRestartPolicy {
  /** Always */
  ALWAYS = "Always",
  /** Never */
  NEVER = "Never",
  /** OnFailure */
  ON_FAILURE = "OnFailure",
}

/**
 * Type of daemon set update.
 *
 * @default "RollingUpdate"
 */
export enum DaemonSetUpdateStrategyType {
  /** OnDelete - Replace the old daemons only when it's killed */
  ON_DELETE = "OnDelete",
  /** RollingUpdate - Replace the old daemons by new ones using rolling update i.e replace them on each node one after the other. */
  ROLLING_UPDATE = "RollingUpdate",
}

/**
 * Type of deployment.
 *
 * @default "RollingUpdate"
 */
export enum DeploymentStrategyType {
  /** Recreate - Kill all existing pods before creating new ones. */
  RECREATE = "Recreate",
  /** RollingUpdate - Replace the old ReplicaSets by new one using rolling update i.e gradually scale down the old ReplicaSets and scale up the new one. */
  ROLLING_UPDATE = "RollingUpdate",
}

/**
 * Type of update strategy.
 *
 * @default "RollingUpdate"
 */
export enum StatefulSetUpdateStrategyType {
  /** OnDelete - triggers the legacy behavior. Version tracking and ordered rolling restarts are disabled. Pods are recreated from the StatefulSetSpec when they are manually deleted. When a scale operation is performed with this strategy,specification version indicated by the StatefulSet's currentRevision.*/
  ON_DELETE = "OnDelete",
  /** RollingUpdate - indicates that update will be applied to all Pods in the StatefulSet with respect to the StatefulSet ordering constraints. When a scale operation is performed with this strategy, new Pods will be created from the specification version indicated by the StatefulSet's updateRevision.*/
  ROLLING_UPDATE = "RollingUpdate",
}

/**
 * Protocol for port.
 *
 * @default "TCP"
 */
export enum PortProtocol {
  /** The SCTP protocol. */
  SCTP = "SCTP",
  /** The TCP protocol. */
  TCP = "TCP",
  /** The UDP protocol. */
  UDP = "UDP",
}

/**
 * Determines how the Service is exposed. Defaults to ClusterIP.
 *
 * @see https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types
 * @default "ClusterIP"
 */
export enum ServiceSpecType {
  /**
   * ClusterIP means a service will only be accessible inside the cluster,
   * via the cluster IP.
   */
  CLUSTER_IP = "ClusterIP",
  /**
   * ExternalName means a service consists of only a reference to an external
   * name that kubedns or equivalent will return as a CNAME record, with no
   * exposing or proxying of any pods involved.
   */
  EXTERNAL_NAME = "ExternalName",
  /**
   * LoadBalancer means a service will be exposed via an external load balancer
   * (if the cloud provider supports it), in addition to 'NodePort' type.
   */
  LOAD_BALANCER = "LoadBalancer",
  /**
   * NodePort means a service will be exposed on one port of every node,
   * in addition to 'ClusterIP' type.
   */
  NODE_PORT = "NodePort",
}
