# deploy-k8s-helper 

A small helper program to aid in creating a test cluster for https://github.com/sourcegraph/deploy-sourcegraph. 

## Prerequisites 

- [Pulumi](https://pulumi.io/quickstart/install.html)
    - Run `pulumi login` after installation
- [Yarn](https://yarnpkg.com/en/)
- GCP access to the ["Sourcegraph Auxiliary" (sourcegraph-dev) GCP project](https://console.cloud.google.com/kubernetes/list?project=sourcegraph-server)
    - Run `gcloud auth application-default login` to fetch the necessary credentials for Pulumi to use 
- https://github.com/sourcegraph/deploy-sourcegraph checked out on your local machine 

### Configuration

See [config.ts](config.ts) for more information, but you must set the following configuration values via `pulumi config set <NAME> <VALUE>`

- `gcloudEmail` -  The email that you use to sign in to our GCP project.
    - example: geoffrey@sourcegraph.com
- `deploySourcegraphRoot` - The path to the root of your https://github.com/sourcegraph/deploy-sourcegraph checkout.
    - example: /Users/ggilmore/dev/go/src/github.com/sourcegraph/deploy-sourcegraph

## Usage 

Run `yarn` so that you install all the necessary dependencies. 

- `yarn up`: creates a new GKE cluster and fetches the necessary credentials
- `yarn destroy`: creates a GKE cluster that was previously created with `yarn up`
- `yarn web`: opens the GCP page for your cluster in your webrowser
