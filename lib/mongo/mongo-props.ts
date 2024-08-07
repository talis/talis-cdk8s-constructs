import { Quantity, ResourceRequirements } from "../../imports/k8s";

export interface MongoProps {
  /**
   * Custom selector labels, they will be merged with the default app, role, and instance.
   * They will be applied to the workload, the pod and the service.
   * @default { app: "<app label from chart>", role: "cronjob", instance: "<construct id>" }
   */
  readonly selectorLabels?: { [key: string]: string };

  /**
   * Number of Pod replicas.
   * @default 1
   */
  readonly replicas?: number;

  /**
   * Name of the replica set. If set then a replica set is set up.
   */
  readonly replicaSetName?: string;

  /** Release version of the Docker image. */
  readonly release: string;

  /**
   * The storage engine to use
   * @default mmapv1
   */
  readonly storageEngine?: "wiredTiger" | "inMemory" | "mmapv1";

  /**
   * Override the default arguments (storageEngine) to the container.
   */
  readonly customArgs?: string[];

  /**
   * Name of the StorageClass to use for the volume claim.
   * @default "general-purpose-delete"
   */
  readonly storageClassName?: string;

  /**
   * Storage for the mongo pod
   * @default Quantity.fromString("20Gi")
   */
  readonly storageSize?: Quantity;

  /**
   * Resources for the mongo Pod
   * @default { limits: { cpu: "100m", memory: "500Mi" } }
   */
  readonly resources?: ResourceRequirements;

  /**
   * Pod's priority class.
   * @default "database"
   */
  readonly priorityClassName?: string;

  /**
   * Create an internal NLB for the service.
   * @default false
   */
  readonly exposeService?: boolean;
}
