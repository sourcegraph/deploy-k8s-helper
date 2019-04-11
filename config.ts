import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'

const config = new pulumi.Config()

export const clusterConfig = {
    /**
     * The name for the GKE cluster. A name will be auto-generated
     * for the cluster if the configuation value is undefefined.
     */
    name: config.get('clusterName'),

    /**
     * The number of nodes to create in this cluster.
     * Defaults to 4.
     */
    nodeCount: config.getNumber('nodeCount') || 4,

    /**
     * The name of a Google Compute Engine machine type.
     * Defaults to n1-standard-8.
     */
    machineType: config.get('machineType') || 'n1-standard-8',
}

export const gcloudConfig = {
    /**
     * The name of the GCP Project to create the cluster inside of.
     * Defaults to 'sourcegraph-server' (Sourcegraph Auxiliary).
     */
    project: gcp.config.project || 'sourcegraph-server',

    /**
     * The name of the GCP zone to create the cluster inside of.
     * Defaults to 'us-central1-a'.
     */
    zone: gcp.config.zone || 'us-central1-a',

    /**
     * The email that you use to sign in to our GCP project.
     * Example: geoffrey@sourcegraph.com
     */
    username: config.require('gcloudEmail'),
}

/**
 * The path to the root of your sourcegraph/deploy-sourcegraph checkout.
 * Example: /Users/ggilmore/dev/go/src/github.com/sourcegraph/deploy-sourcegraph
 */
export const deploySourcegraphRoot = config.require('deploySourcegraphRoot')
