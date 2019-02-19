# deploy-k8s-helper 

A small helper program to aid in creating a test cluster for https://github.com/sourcegraph/deploy-sourcegraph. 

## Prerequisites 

- [Pulumi](https://pulumi.io/quickstart/install.html)
    - Run `pulumi login` after installation
- [Yarn](https://yarnpkg.com/en/)
- GCP access to the ["Sourcegraph Auxiliary" (sourcegraph-dev) GCP project](https://console.cloud.google.com/kubernetes/list?project=sourcegraph-server)
    - Run `gcloud auth application-default login` to fetch the necessary credentials for Pulumi to use 

## Usage 

- `yarn up`: creates a new GKE cluster and fetches the necessary credentials
- `yarn destroy`: creates a GKE cluster that was previously created with `yarn up`
- `yarn web`: opens the GCP page for your cluster in your webrowser
