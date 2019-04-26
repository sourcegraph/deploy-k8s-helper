import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import * as k8s from '@pulumi/kubernetes'
import * as yaml from 'js-yaml'

import { k8sProvider } from './cluster'
import { deploySourcegraphRoot, gcloudConfig } from './config'

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

// const storageClass = new k8s.storage.v1.StorageClass(
//     'sourcegraph-storage-class',
//     {
//         metadata: {
//             name: 'sourcegraph',

//             labels: {
//                 deploy: 'sourcegraph',
//             },
//         },
//         provisioner: 'kubernetes.io/gce-pd',

//         parameters: {
//             type: 'pd-ssd',
//         },
//     },
//     { provider: k8sProvider }
// )

// const baseDeployment = new k8s.yaml.ConfigGroup(
//     'base',
//     {
//         files: `${path.posix.join(deploySourcegraphRoot, 'base')}/**/*.yaml`,
//     },
//     {
//         providers: { kubernetes: k8sProvider },
//         dependsOn: [clusterAdmin, storageClass],
//     }
// )

// const ingressNginx = new k8s.yaml.ConfigGroup(
//     'ingress-nginx',
//     {
//         files: `${path.posix.join(deploySourcegraphRoot, 'configure', 'ingress-nginx')}/**/*.yaml`,
//     },
//     { providers: { kubernetes: k8sProvider }, dependsOn: clusterAdmin }
// )

// export const ingressIPs = ingressNginx
//     .getResource('v1/Service', 'ingress-nginx', 'ingress-nginx')
//     .apply(svc => svc.status.apply(status => status.loadBalancer.ingress.map(i => i.ip)))

const sourcegraph = new k8s.helm.v2.Chart(
    'sourcegraph',
    {
        chart: 'https://github.com/sourcegraph/deploy-sourcegraph/archive/v2.13.5-helm.tar.gz',
        values: yaml.safeLoad(fs.readFileSync('values.yaml').toString()),
    },
    {
        providers: { kubernetes: k8sProvider },
        dependsOn: clusterAdmin,
    }
)

export * from './cluster'
