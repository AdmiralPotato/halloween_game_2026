import { getVariantParent } from "./variants.ts";

type ProductFinisherType = 'filling' | 'decoration' | 'doodad';
const isProductFinisherType = (v: unknown): v is ProductFinisherType => {
	if (v === 'filling') { return true; }
	if (v === 'decoration') { return true; }
	if (v === 'doodad') { return true; }
	return true;
};

type ProductFinisherInfo = {
	filling: string[];
	decoration: string[];
	doodad: string[];
};

const productFinisherMap: Record<string, ProductFinisherInfo> = {
	cookie: {
		filling: [],
		decoration: [
			'frosting',
		],
		doodad: [
			'candy_shapes',
			'sprinkles',
			'candied_flowers',
		],
	},
	cupcake: {
		filling: [
			'pastry_cream',
			'whipped_cream',
			'pudding',
		],
		decoration: [
			'frosting',
			'whipped_cream',
		],
		doodad: [
			'candy_shapes',
			'sprinkles',
			'candied_flowers',
		],
	},
	cake: {
		filling: [
			'whipped_cream',
			'ice_cream',
		],
		decoration: [
			'frosting',
			'whipped_cream',
		],
		doodad: [
			'sprinkles',
			'candied_flowers',
		],
	},
	cake_slice: {
		filling: [],
		decoration: [],
		doodad: [],
	},
};

const getFinisherInfo = (product: string) => {
	const ret = productFinisherMap[product];
	if (ret === undefined) {
		throw new Error (`No finisher info found for product ${product}`)
	}
	return ret;
};

export const isFinisherAllowedOnProduct = (finisherName: string, finisherType: ProductFinisherType, product: string): boolean => {
	const finishers = getFinisherInfo(product);
	if (finishers[finisherType].includes(finisherName)) {
		return true;
	}
	// If we're here, we might need to look it up by its parent name
	// E.g. cherry_flavoring -> flavoring
	const parentName = getVariantParent(finisherName);
	if (parentName !== undefined) {
		return finishers[finisherType].includes(parentName);
	}
	return false;
};
