import { Construct } from "constructs";
import { ApiObject, Chart, ChartProps, Lazy } from "cdk8s";
import { KubeNamespace, KubeResourceQuota } from "../../imports/k8s";
import {
  addAppMeshIdentityLabels,
  addAwsAppMeshInjectionLabels,
  addAppMeshRoleToDefaultServiceAccount,
  joinNameParts,
} from "../common";
import { TalisShortRegion } from "./talis-region";
import { TalisDeploymentEnvironment } from "./talis-deployment-environment";
import { calculateResourceQuota } from "./calculate-resource-quota";
import { TalisAppMeshConfiguration } from "./talis-app-mesh-configuration";

export interface TalisChartProps extends ChartProps {
  /** Name of the application this chart is for */
  readonly app?: string;
  /** Release version of the application this chart is for */
  readonly release?: string;
  /** Environment that this application is deployed in */
  readonly environment: TalisDeploymentEnvironment;
  /** Short region code */
  readonly region: TalisShortRegion;
  /** An identifier, will be appended to the namespace */
  readonly watermark: string;
  /** Timestamp after which the namespace will be deleted */
  readonly ttl?: number;
  /**
   * Whether to include an automatically-calculated ResourceQuota for the chart's namespace.
   * @default true
   */
  readonly includeResourceQuota?: boolean;
  readonly appMeshConfiguration?: TalisAppMeshConfiguration;
}

/** @private */
interface TalisChartConstructorProps extends TalisChartProps {
  readonly app: string;
  readonly release: string;
}

export class TalisChart extends Chart {
  /** Name of the application this chart is for */
  public readonly app: string;
  /** The namespace for all objects in this chart. */
  public readonly namespace: string;
  /** The namespace API object */
  public readonly kubeNamespace: KubeNamespace;
  /** The name of the App Mesh associated with this chart. */
  public readonly appMeshConfiguration?: TalisAppMeshConfiguration;

  constructor(scope: Construct, props: TalisChartConstructorProps) {
    const { app, release, environment, region, watermark, ttl } = props;
    const maybeEnvironment =
      environment !== TalisDeploymentEnvironment.PRODUCTION ? environment : "";
    const maybeWatermark =
      environment === TalisDeploymentEnvironment.ONDEMAND ||
      environment === TalisDeploymentEnvironment.PREVIEW
        ? watermark
        : "";
    const namespace = props.namespace ?? joinNameParts([app, watermark]);
    const id = `${namespace}-${environment}-${region}`;

    const labels: Record<string, string> = {
      app: app,
      environment: environment,
      region: region,
      "managed-by": "cdk8s",
      service: joinNameParts([app, maybeWatermark, maybeEnvironment, region]),
      ...props.labels,
    };

    super(scope, id, {
      namespace: namespace,
      labels: labels,
    });

    const namespaceLabels: Record<string, string> = { ...labels, release };
    if (ttl) {
      namespaceLabels.ttl = ttl.toString();
    }

    this.app = app;
    this.namespace = namespace;
    this.kubeNamespace = new KubeNamespace(this, "namespace", {
      metadata: {
        name: this.namespace,
        labels: namespaceLabels,
      },
    });
    this.appMeshConfiguration = props.appMeshConfiguration;

    if (props.includeResourceQuota ?? true) {
      new KubeResourceQuota(this, "quota", {
        spec: Lazy.any({
          produce: () => calculateResourceQuota(this.node.findAll()),
        }),
      });
    }

    if (props.appMeshConfiguration?.enabled) {
      addAppMeshIdentityLabels(this, props.appMeshConfiguration.meshName);
      if (props.appMeshConfiguration.injectSidecar) {
        addAwsAppMeshInjectionLabels(this);
      }
      if (
        props.appMeshConfiguration.addToDefaultServiceAccount &&
        props.appMeshConfiguration.serviceRoleArn
      ) {
        addAppMeshRoleToDefaultServiceAccount(
          this,
          props.appMeshConfiguration.serviceRoleArn,
        );
      }
    }
  }

  generateObjectName(apiObject: ApiObject): string {
    return apiObject.node.id;
  }

  appMeshEnabled(): boolean {
    return (
      this.appMeshConfiguration !== undefined &&
      this.appMeshConfiguration.enabled
    );
  }
}
