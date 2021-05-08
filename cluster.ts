import * as gcp from '@pulumi/gcp'
import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'

import * as os from 'os'
import { URL } from 'url'

import { clusterConfig, gcloudConfig } from './config'

const name = clusterConfig.name || `${os.userInfo().username}-sourcegraph-test`

const cluster = new gcp.container.Cluster(name, {
    // Don't auto-generate a name iff the user explicitly defined one.
    name: clusterConfig.name,

    description: 'Scratch cluster used for testing sourcegraph/deploy-sourcegraph',

    location: gcloudConfig.location,
    project: gcloudConfig.project,

    initialNodeCount: clusterConfig.nodeCount,

    nodeConfig: {
        diskType: 'pd-ssd',
        localSsdCount: 1,
        machineType: clusterConfig.machineType,

        oauthScopes: [
            'https://www.googleapis.com/auth/compute',
            'https://www.googleapis.com/auth/devstorage.read_only',
            'https://www.googleapis.com/auth/logging.write',
            'https://www.googleapis.com/auth/monitoring',
        ],
    },
})

export const clusterContext = pulumi
    .all([cluster.name, cluster.location, cluster.project])
    .apply(([name, location, project]) => `gke_${project}_${location}_${name}`)

export const kubeconfig = pulumi
    .all([clusterContext, cluster.endpoint, cluster.masterAuth])
    .apply(([context, endpoint, masterAuth]) => {
        return `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${masterAuth.clusterCaCertificate}
    server: https://${endpoint}
  name: ${context}
contexts:
- context:
    cluster: ${context}
    user: ${context}
  name: ${context}
current-context: ${context}
kind: Config
preferences: {}
users:
- name: ${context}
  user:
    auth-provider:
      config:
        cmd-args: config config-helper --format=json
        cmd-path: gcloud
        expiry-key: '{.credential.token_expiry}'
        token-key: '{.credential.access_token}'
      name: gcp
`
    })

export const gcloudAuthCommand = pulumi
    .all([cluster.name, cluster.location, cluster.project])
    .apply(
        ([name, location, project]) =>
            `gcloud container clusters get-credentials ${name} --location ${location} --project ${project}`
    )

export const gcpURL = pulumi
    .all([cluster.name, cluster.location, cluster.project])
    .apply(([name, location, project]) => {
        const url = new URL(`${location}/${name}`, 'https://console.cloud.google.com/kubernetes/clusters/details/')
        url.searchParams.set('project', project)
        return url.toString()
    })

export const k8sProvider = new k8s.Provider(name, {
    kubeconfig,
})
