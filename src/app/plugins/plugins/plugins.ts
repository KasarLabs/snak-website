import { Plugin } from "../utils/types"

export const allPlugins: Array<Plugin> = [
	{
		id: '8d3e05ef-c85a-43cc-8e57-486e94fcf39e',
		name: 'Unruggable',
		description: 'Create secure, transparent memecoins with built-in protections against common exploits and rug pulls',
		image: '/logos/unruggable.png',

		actions: [
			{
			name: 'Create Memecoin',
			description: 'Deploy a new memecoin contract with built-in security features and customizable parameters',
			parameters: [
				{
				name: 'owner',
				type: 'string',
				description: 'Owner address of the memecoin',
				required: true
				},
				{
				name: 'name',
				type: 'string',
				description: 'Name of the memecoin',
				required: true
				},
				{
				name: 'symbol',
				type: 'string',
				description: 'Symbol of the memecoin',
				required: true
				},
				{
				name: 'initialSupply',
				type: 'string',
				description: 'Initial supply of tokens (will be scaled by 18 decimals)',
				required: true
				}
			]
			},
			{
			name: 'Verify Memecoin',
			description: 'Check if a contract is a legitimate memecoin created by the Unruggable Factory',
			parameters: [
				{
				name: 'contractAddress',
				type: 'string',
				description: 'Address of the contract to verify',
				required: true
				}
			]
			},
			{
			name: 'Launch on Ekubo',
			description: 'Launch memecoin on Ekubo DEX with concentrated liquidity and trading restrictions',
			parameters: [
				{
				name: 'memecoinAddress',
				type: 'string',
				description: 'Address of the memecoin to launch',
				required: true
				},
				{
				name: 'transferRestrictionDelay',
				type: 'number',
				description: 'Delay in seconds before transfers are allowed',
				required: true
				},
				{
				name: 'maxPercentageBuyLaunch',
				type: 'number',
				description: 'Maximum percentage of tokens that can be bought at launch',
				required: true
				},
				{
				name: 'startingPrice',
				type: 'string',
				description: 'Initial trading price of the token',
				required: true
				}
			]
			},
			{
			name: 'Check Locked Liquidity',
			description: 'Verify if a memecoin has locked liquidity and get detailed information about the liquidity lock',
			parameters: [
				{
				name: 'contractAddress',
				type: 'string',
				description: 'Address of the memecoin contract to check',
				required: true
				}
			]
			}
		]
	},
	{
		id: '2',
		name: 'Text Processor',
		description: 'Advanced text manipulation tools',
		image: '/logos/text-processor.png',
		actions: [
			{
			name: 'Format Converter',
			description: 'Convert between different text formats'
			},
			{
			name: 'Key Information',
			description: 'Extract important information from text'
			}
		]
	},
];
