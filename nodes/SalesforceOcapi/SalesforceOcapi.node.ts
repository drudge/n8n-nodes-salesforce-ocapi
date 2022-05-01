import { IExecuteFunctions } from 'n8n-core';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { ISalesforceOcapiCredentials } from './SalesforceOcapi.node.types';

import * as ocapi from '@fye/ocapi';

export class SalesforceOcapi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Salesforce OpenCommerce API',
		name: 'salesforceOcapi',
		group: ['salesforce', 'ocapi', 'demandware'],
		version: 1,
		description: 'OCAPI for Salesforce Commerce Cloud',
		defaults: {
			name: 'OCAPI',
			color: '#772244',
		},
		icon: 'file:salesforce.svg',
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'salesforceOcapi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Site ID',
				name: 'siteId',
				type: 'string',
				default: '',
				placeholder: 'SiteGenesis',
				description: 'The SFCC site ID (e.g. SiteGenesis)',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{
						name: 'Get Product',
						value: 'getProduct',
					},
					{
						name: 'Search Products',
						value: 'searchProducts',
					},
					{
						name: 'Get Order',
						value: 'getOrder',
					},
					{
						name: 'Search Orders',
						value: 'searchOrders',
					},
				],
				default: 'getProduct',
				description: 'OCAPI Operation',
			},
			{
				displayName: 'Product ID',
				name: 'productId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: [
							'getProduct',
						],
					},
				},
				description: 'The product ID to retreive',
			},
			{
				displayName: 'Order Number',
				name: 'orderNo',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: [
							'getOrder',
						],
					},
				},
				description: 'The order number to retreive',
			},
			{
				displayName: 'Select Fields',
				name: 'select',
				type: 'string',
				required: true,
				default: '(**)',
				displayOptions: {
					show: {
						operation: [
							'searchOrders',
						],
					},
				},
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'json',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: [
							'searchOrders',
						],
					},
				},
			},
			{
				displayName: 'Expand',
				name: 'expand',
				type: 'collection',
				placeholder: 'Expand',
				default: {},
				displayOptions: {
					show: {
						operation: [
							'getProduct',
						],
					},
				},
				options: [
					{
						displayName: 'Expansion',
						name: 'type',
						type: 'options',
						options: [
							{
								name: 'All',
								value: 'all',
							},
							{
								name: 'Availability',
								value: 'availability',
							},
							{
								name: 'Images',
								value: 'images',
							},
							{
								name: 'All Images',
								value: 'all_images',
							},
							{
								name: 'Categories',
								value: 'categories',
							},
							{
								name: 'Options',
								value: 'options',
							},
							{
								name: 'Prices',
								value: 'prices',
							},
							{
								name: 'Variations',
								value: 'variations',
							},
							{
								name: 'Sets',
								value: 'sets',
							},
							{
								name: 'Bundles',
								value: 'bundles',
							},
						],
						default: '',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const credentials = (await this.getCredentials('salesforceOcapi') as ISalesforceOcapiCredentials);
		const siteId = this.getNodeParameter('siteId', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const config = ocapi.getConfig({
			clientId: credentials.clientId,
			clientSecret: credentials.clientSecret,
			host: credentials.hostname,
			siteId,
			version: credentials.version,
		});
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			if (operation === 'searchOrders') {
				const select = this.getNodeParameter('select', itemIndex, '{}') as string;	
				const query = JSON.parse(this.getNodeParameter('query', itemIndex) as string);	
				for await (const json of ocapi.searchOrders({ config, select, query })) {
					returnData.push({ json });
				}
			} else if ([ 'getOrder', 'getProduct' ].includes(operation)) {
				if (operation === 'getProduct') {
					const productId = this.getNodeParameter('productId', itemIndex) as string;	
					const expand = this.getNodeParameter('expand', itemIndex) as IDataObject & { type: '' };
					returnData.push({ json: await ocapi.getProduct(config, expand.type ? `${productId}?expand=${expand.type}` : productId) });
				}// } else if (operation === 'getOrder') {
				// 	const orderNo = this.getNodeParameter('orderNo', itemIndex) as string;	
				// 	item.json = await ocapi.getOrder(config, orderNo);
				// } 
			}
		}

		return this.prepareOutputData(returnData);
	}
}
