# deploy-k8s-helper

A small helper program to aid in creating a test cluster for https://github.com/sourcegraph/deploy-sourcegraph.

## Prerequisites

- [Pulumi](https://pulumi.io/quickstart/install.html)
  - Run `pulumi login` after installation
- [Yarn](https://yarnpkg.com/en/)
- GCP access to the ["Sourcegraph Auxiliary" (sourcegraph-server) GCP project](https://console.cloud.google.com/kubernetes/list?project=sourcegraph-server)
  - Run `gcloud auth application-default login` to fetch the necessary credentials for Pulumi to use
- https://github.com/sourcegraph/deploy-sourcegraph checked out on your local machine
  - deploy-k8s-helper reads the contents of that directory. Make sure your that your checkout is up-to-date!

### Configuration

See [config.ts](config.ts) for more information, but you **must** set the following configuration values via `pulumi config set <NAME> <VALUE>`

- `gcloudEmail` - The email that you use to sign in to our GCP project.
  - example: geoffrey@sourcegraph.com
- `deploySourcegraphRoot` - The path to the root of your https://github.com/sourcegraph/deploy-sourcegraph checkout.
  - example: /Users/ggilmore/dev/go/src/github.com/sourcegraph/deploy-sourcegraph

## Usage

Run `yarn` so that you install all the necessary dependencies.

- `yarn up`: creates a new GKE cluster and fetches the necessary credentials
- `yarn destroy`: deletes a GKE cluster that was previously created with `yarn up`
- `yarn auth`: fetch the credentials so that kubectl can speak to the cluster
- `yarn deauth`: remove the cluster's kubectl credentials
- `yarn web`: opens the GCP page for your cluster in your webrowser

## Troubleshooting

### The zone '...' doesn't have enough resources to fulfill the request

Example:

```
Do you want to perform this update? yes
Updating (dev):

     Type                      Name                       Status                  Info
 +   pulumi:pulumi:Stack       sg-deploy-k8s-helper-dev   **creating failed**     1 error
 +   └─ gcp:container:Cluster  geoffrey-sourcegraph-test  **creating failed**     1 error

Diagnostics:
  pulumi:pulumi:Stack (sg-deploy-k8s-helper-dev):
    error: update failed

  gcp:container:Cluster (geoffrey-sourcegraph-test):
    error: Plan apply failed: Error waiting for creating GKE cluster: Deploy error: Not all instances running in IGM after 46.650887217s. Expect 4. Current errors: [ZONE_RESOURCE_POOL_EXHAUSTED_WITH_DETAILS]: Instance 'gke-geoffrey-sourcegraph-default-pool-7f493867-0bmt' creation failed: The zone 'projects/sourcegraph-server/zones/us-central1-a' does not have enough resources available to fulfill the request.  '(resource type:compute)'. - ; .
```

Solution: Pick another zone to use from https://cloud.google.com/compute/docs/regions-zones/#available. Set it in your stack configuration by running `pulumi config set gcp:zone [NEW_ZONE]`

### (ingress-nginx) Cannot read property 'status' of undefined

This happens if you're trying to deploy a pre-`3.x` release of https://github.com/sourcegraph/deploy-sourcegraph/ (which didn't have `nginx-ingress`).

Example:

```
Diagnostics:
  pulumi:pulumi:Stack (sg-deploy-k8s-helper-dev):
    error: Running program '/Users/ggilmore/dev/go/src/github.com/sourcegraph/ds-k8s-helper' failed with an unhandled exception:
    TypeError: Cannot read property 'status' of undefined
        at exports.ingressIPs.ingressNginx.getResource.apply.svc (/Users/ggilmore/dev/go/src/github.com/sourcegraph/ds-k8s-helper/index.ts:49:23)
        at OutputImpl.<anonymous> (/Users/ggilmore/dev/go/src/github.com/sourcegraph/ds-k8s-helper/node_modules/@pulumi/kubernetes/node_modules/@pulumi/pulumi/output.js:102:47)
        at Generator.next (<anonymous>)
        at fulfilled (/Users/ggilmore/dev/go/src/github.com/sourcegraph/ds-k8s-helper/node_modules/@pulumi/kubernetes/node_modules/@pulumi/pulumi/output.js:17:58)
```

Solution: Comment out the `const ingressNginx` and `export const ingressIPs` variables in https://github.com/sourcegraph/deploy-k8s-helper/blob/master/index.ts : https://github.com/sourcegraph/deploy-k8s-helper/blob/87bce4bb4f4448336a5b7feabca23bf1747b9fda/index.ts#L61-L72
