import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();

export const clusterConfig = {
	name: config.get('clusterName'),

	nodeCount: config.getNumber('nodeCount') || 3,

	machineType: config.get('machineType') || 'n1-standard-8',

	project: config.get('gcp:project') || 'sourcegraph-server',

	zone: config.get('gcp:zone') || 'us-central1-a'
};
