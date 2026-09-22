import express, { type Router } from 'express'
import { isFruitFromDb, isReviewFromDb, ReviewsFromDbSchema, type Fruit, type FruitFromDb, type Review, type ReviewFromDb, type ReviewsFromDb } from '../types.ts';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import db from '../aws.ts'
import { extractIdFromPk, getMessage } from '../helpers.ts';


const router: Router = express.Router()

const myTable: string = 'fed25-fruits'  // din tabell

type IdParam = { id: string; }
type IdResponse = { id: string; }


// GET /reviews/:id
// id för en frukt - kan ha flera recensioner
router.get<IdParam, Review | void>('/:id', async (req, res) => {
	const id: string = req.params.id
	// skicka kommando
	// inspektera resultatet
	// skapa ett review-objekt och svara med det

	const command = new QueryCommand({
		TableName: myTable,
		KeyConditionExpression: `pk = :pk`,
		ExpressionAttributeValues: {
			':pk': `FRUIT#${id}`
		}
	})
	try {
		const result = await db.send(command)
		console.log('Querycommmand result:', result.Items)
		const items: ReviewsFromDb = ReviewsFromDbSchema.parse(result.Items)

		const fruit: FruitFromDb | undefined = items.find(isFruitFromDb)
		if( !fruit ) {
			res.sendStatus(404)
			console.log('Letade efter en frukt som inte finns')
			return
		}
		// använd filter för att slägna frukten och behålla reviews
		// använd map för att göra om review-objekten till bara number
		// isReviewFromDb kallas "type guard" och behövs för att slippa använda "as"
		const reviews: ReviewFromDb[] = items.filter(isReviewFromDb)
		const review: Review = {
			fruit: {
				id: extractIdFromPk(fruit.pk),
				name: fruit.name,
				price: fruit.price
			},
			scores: reviews.map(review => review.score)
		}
		console.log('Färdigt review-objekt:', review)
		res.send(review)
		
	} catch(error) {
		console.log('GET review error:', getMessage(error))
		res.sendStatus(500)
	}
})

export default router
