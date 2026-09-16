import * as z from 'zod'


export const FruitSchema = z.object({
	id: z.string(),
	name: z.string(),
	price: z.number()
})

export type Fruit = z.infer<typeof FruitSchema>


export const FruitFromDbSchema = z.object({
	sk: z.string(),
	pk: z.string(),
	price: z.number(),
	name: z.string()
})

export const FruitListFromDbSchema = z.array(FruitFromDbSchema)
