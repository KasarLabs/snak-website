export interface Placeholder {
	id: string;
	name : string;
	image?: string;
	color?: string;
}

export interface ActionParameter {
	name: string;
	type: string;
	description: string;
	required: boolean;
}

export interface Action {
	name: string;
	description: string;
	parameters?: ActionParameter[];
}

export interface Plugin {
	id: string;
	name: string;
	description: string;
	image: string;
	actions: Action[];
}

export type GridItem = (Plugin | Placeholder) & { x: number; y: number; color?: string };
