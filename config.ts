import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();

export const clusterConfig = {
	name: config.get('clusterName'),

	nodeCount: config.getNumber('nodeCount') || 4,

	machineType: config.get('machineType') || 'n1-standard-8'
};

export const gcloudConfig = {
	project: gcp.config.project || 'sourcegraph-server',

	zone: gcp.config.zone || 'us-central1-a',

	username: config.require('gcloudEmail')
};
