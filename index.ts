import * as os from 'os'
import * as path from 'path'

import * as k8s from '@pulumi/kubernetes'
import * as yaml from 'js-yaml'

import { k8sProvider } from './cluster'
import { deploySourcegraphRoot, gcloudConfig } from './config'

// const clusterAdmin = new k8s.rbac.v1.ClusterRoleBinding(
//     'cluster-admin-role-binding',
//     {
//         metadata: { name: `${os.userInfo().username}-cluster-admin-role-binding` },

//         roleRef: {
//             apiGroup: 'rbac.authorization.k8s.io',
//             kind: 'ClusterRole',
//             name: 'cluster-admin',
//         },

//         subjects: [
//             {
//                 apiGroup: 'rbac.authorization.k8s.io',
//                 kind: 'User',
//                 name: gcloudConfig.username,
//             },
//         ],
//     },
//     { provider: k8sProvider }
// )

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

const values = yaml.safeLoad(`
cluster:
  frontend:
    containers:
      frontend:
        limits:
          cpu: "1"
        requests:
          cpu: "1"
    nodeSelector:
      beta.kubernetes.io/instance-type: m4.4xlarge
    replicas: 2
  githubProxy:
    nodeSelector:
      beta.kubernetes.io/instance-type: m4.4xlarge
  gitserver:
    containers:
      gitserver:
        limits:
          cpu: "8"
          memory: 8Gi
        requests:
          cpu: "8"
          memory: 8Gi
    diskSize: 200Gi
    nodeSelector:
      beta.kubernetes.io/instance-type: i3.4xlarge
    shards: 3
  indexedSearch:
    diskSize: 600Gi
    nodeSelector:
      beta.kubernetes.io/instance-type: m4.4xlarge
  lspProxy:
    nodeSelector:
      beta.kubernetes.io/instance-type: i3.4xlarge
  searcher:
    nodeSelector:
      beta.kubernetes.io/instance-type: i3.4xlarge
    replicas: 7
  storageClass:
    create: none
    name: standard
  symbols:
    replicas: 4
  xlangGo:
    nodeSelector:
      beta.kubernetes.io/instance-type: i3.4xlarge
    replicas: 2
  xlangJava:
    nodeSelector:
      beta.kubernetes.io/instance-type: i3.4xlarge
    replicas: 2
  xlangJavascriptTypescript:
    nodeSelector:
      beta.kubernetes.io/instance-type: i3.4xlarge
  xlangPHP:
    nodeSelector:
      beta.kubernetes.io/instance-type: i3.4xlarge
  xlangPython:
    nodeSelector:
      beta.kubernetes.io/instance-type: i3.4xlarge
    replicas: 4
site:
  appURL: https://sourcegraph.lyft.net
  auth.provider: saml
  auth.saml:
    identityProviderMetadataURL: http://saml-metadata/saml-metadata.xml
    serviceProviderCertificate: REDACTED
    serviceProviderPrivateKey: REDACTED
    type: ""
  experimentalFeatures: {}
  gitMaxConcurrentClones: 3
  github:
  - initialRepositoryEnablement: true
    token: REDACTED
    url: https://github.com
  httpNodePort: 30080
  langservers:
  - language: go
  - language: javascript
  - language: typescript
  - initializationOptions:
      pipArgs:
      - --index-url=https://pypi.lyft.net/pypi/
    language: python
  - language: java
  - language: php
  maxReposToSearch: 999999
  repoListUpdateInterval: 15
  siteID: "123123123123"
  update.channel: release
`)

const sourcegraph = new k8s.helm.v2.Chart(
    'sourcegraph',
    {
        chart: 'https://github.com/sourcegraph/deploy-sourcegraph/archive/v2.13.5-helm.tar.gz',
        values,
    },
    {
        providers: { kubernetes: k8sProvider },
    }
)

export * from './cluster'
