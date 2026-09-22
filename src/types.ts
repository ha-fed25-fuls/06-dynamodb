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
export type FruitFromDb = z.infer<typeof FruitFromDbSchema>

// Alla recensioner för en frukt - kan inte ändras, så vi behöver inte id för recensionerna
export type Review = {
	fruit: Fruit;
	scores: number[];
}

export const ReviewFromDbSchema = z.object({
	pk: z.string(),
	sk: z.string(),
	score: z.number()
})
export type ReviewFromDb = z.infer<typeof ReviewFromDbSchema>

// type exempel = (Fruit | Review)[]
export const ReviewsFromDbSchema = z.array(z.union([ FruitFromDbSchema, ReviewFromDbSchema ]))

export type ReviewsFromDb = z.infer<typeof ReviewsFromDbSchema>


//  Type guards - använder type predicate (ordet "is") för att ge TypeScript typinformation
export function isFruitFromDb(item: FruitFromDb | ReviewFromDb): item is FruitFromDb {
    return item.sk === 'meta'
}

export function isReviewFromDb(item: FruitFromDb | ReviewFromDb): item is ReviewFromDb {
    return item.sk.startsWith('REVIEW#')
}
