import * as z from 'zod'


export const FruitSchema = z.object({
	id: z.string(),
	name: z.string(),
	price: z.number()
})

export type Fruit = z.infer<typeof FruitSchema>

// Good practice - utgå från befintlig typ i stället för att göra två nästan likadana scheman
export const FruitWithoutIdSchema = FruitSchema.omit({ id: true })

export type FruitWithoutId = z.infer<typeof FruitWithoutIdSchema>


export const FruitFromDbSchema = z.object({
	sk: z.string(),
	pk: z.string(),
	price: z.number(),
	name: z.string()
})

export const FruitListFromDbSchema = z.array(FruitFromDbSchema)
