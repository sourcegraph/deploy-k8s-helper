import * as os from 'os'
import * as path from 'path'

import * as k8s from '@pulumi/kubernetes'

import { k8sProvider } from './cluster'
import { certificate, deploySourcegraphRoot, gcloudConfig, htpassword, key } from './config'

const clusterAdmin = new k8s.rbac.v1.ClusterRoleBinding(
    'cluster-admin-role-binding',
    {
        metadata: { name: `${os.userInfo().username}-cluster-admin-role-binding` },

        roleRef: {
            apiGroup: 'rbac.authorization.k8s.io',
            kind: 'ClusterRole',
            name: 'cluster-admin',
        },

        subjects: [
            {
                apiGroup: 'rbac.authorization.k8s.io',
                kind: 'User',
                name: gcloudConfig.username,
            },
        ],
    },
    { provider: k8sProvider }
)

const storageClass = new k8s.storage.v1.StorageClass(
    'sourcegraph-storage-class',
    {
        metadata: {
            name: 'sourcegraph',

            labels: {
                deploy: 'sourcegraph',
            },
        },
        provisioner: 'kubernetes.io/gce-pd',

        parameters: {
            type: 'pd-ssd',
        },
    },
    { provider: k8sProvider }
)

const tls = new k8s.core.v1.Secret(
    'sourcegraph-tls',
    {
        metadata: {
            name: 'sourcegraph-tls',
        },

        data: {
            'tls.crt': Buffer.from(certificate).toString('base64'),
            'tls.key': Buffer.from(key).toString('base64'),
        },

        type: 'kubernetes.io/tls',
    },
    { provider: k8sProvider }
)

const langserverAuth = new k8s.core.v1.Secret(
    'langserver-auth',
    {
        metadata: {
            name: 'langserver-auth',
        },

        data: {
            auth: Buffer.from(htpassword).toString('base64'),
        },

        type: 'Opaque',
    },
    { provider: k8sProvider }
)

const baseDeployment = new k8s.yaml.ConfigGroup(
    'base',
    {
        files: `${path.posix.join(deploySourcegraphRoot, 'base')}/**/*.yaml`,
    },
    {
        providers: { kubernetes: k8sProvider },
        dependsOn: [clusterAdmin, storageClass, tls],
    }
)

const ingressNginx = new k8s.yaml.ConfigGroup(
    'ingress-nginx',
    {
        files: `${path.posix.join(deploySourcegraphRoot, 'configure', 'ingress-nginx')}/**/*.yaml`,
    },
    { providers: { kubernetes: k8sProvider }, dependsOn: clusterAdmin }
)

const langGo = new k8s.yaml.ConfigGroup(
    'lang-go',
    {
        files: `${path.posix.join(deploySourcegraphRoot, 'configure', 'lang', 'go')}/**/*.yaml`,
    },
    {
        providers: {
            kubernetes: k8sProvider,
        },
        dependsOn: [langserverAuth],
    }
)

const langTypescript = new k8s.yaml.ConfigGroup(
    'lang-typescript',
    {
        files: `${path.posix.join(deploySourcegraphRoot, 'configure', 'lang', 'typescript')}/**/*.yaml`,
    },
    {
        providers: {
            kubernetes: k8sProvider,
        },
        dependsOn: [langserverAuth],
    }
)

export const ingressIPs = ingressNginx
    .getResource('v1/Service', 'ingress-nginx', 'ingress-nginx')
    .apply(svc => svc.status.apply(status => status.loadBalancer.ingress.map(i => i.ip)))

export * from './cluster'
