stack:
	item:
		name: cupcake_pan
		display_name: cupcake pan
		categories:
			"CONTAINER"
	modifiers:
		stack:
			item:
				name: sage
				display_name: sage liner
				categories:
					"MODIFIER"
					"CUPCAKE_LINER"
	contents
		stack:
			item:
				name: cake_batter
				display_name: cake_batter
				categories:
					"IDK"
				modifiers:
					stack:
						item:
							name: blueberry_flavoring
							categories:
								"MODIFIER"
								"FLAVORING"
						count: 2
					stack:
						item:
							name: chocolate_chips
							categories:
								"MODIFIER"
								"CHOCOLATE_CHIPS"
						count: 2

type: cake_batter
details:
	LINER sage
	MODIFIER blueberry_flavoring 2
	MODIFIER CHOCOLATE_CHIPS 2

item
	type: cupcake
	count: 2
	details:
		item
			type: cupcake_liner
			variant: sage
		item
			type: flavoring
			variant: blueberry
			count: 2
		item
			type: chocolate_chips
			variant: milk
			count: 2
		item
			type: frosting
			details:
				item
					type: flavoring
					variant: strawberry
					count: 2
		item
			type: frosting_piping
			details:
				item
					type: flavoring
					variant: lime
					count: 2
