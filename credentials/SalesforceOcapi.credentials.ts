import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SalesforceOcapi implements ICredentialType {
	name = 'salesfoce-ocapi';
	displayName = 'Salesforce OpenCommerce API';
	documentationUrl = 'salesforce';
	properties: INodeProperties[] = [
		{
			displayName: 'Environment Type',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
				{
					name: 'Staging',
					value: 'staging',
				},
				{
					name: 'Sandbox',
					value: 'sandbox',
				},
			],
			default: 'production',
		},
		{
			displayName: 'Hostname',
			name: 'hostname',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			description: 'Consumer Key from Salesforce Connected App',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
		{
			displayName: 'Version',
			name: 'version',
			type: 'string',
			default: '21_1',
			required: true,
		}
	];
}
