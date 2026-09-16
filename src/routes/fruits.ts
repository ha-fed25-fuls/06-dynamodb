import { GetCommand, PutCommand, ScanCommand, UpdateCommand, type GetCommandOutput, type ScanCommandOutput, type UpdateCommandOutput } from "@aws-sdk/lib-dynamodb";
import express, { type Response, type Router } from 'express'
import { FruitFromDbSchema, FruitListFromDbSchema, FruitSchema, type Fruit } from '../types.ts'
import db from '../aws.ts'
import * as z from 'zod'
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";

const router: Router = express.Router()

const myTable: string = 'fed25-fruits'  // din tabell

type IdParam = { id: string; }




// GET /fruits
// vi behöver inte ha med "/fruits" eftersom den finns i server.ts
router.get<{}, Fruit[] | void>('/', async (req, res) => {
	// hämta alla items i en tabell - VARNING! Långsam, använd andra metoder om tabellen växer
	let scanCommand = new ScanCommand({
		TableName: myTable
	})
	const result: ScanCommandOutput = await db.send(scanCommand)
	console.log('GET /fruits, Lyckad hämtning? ', result)
	// result är ett objekt som innehåller Items (optional)

	try {
		const fruitsFromDb = z.parse(FruitListFromDbSchema, result.Items)
		const fruits: Fruit[] = fruitsFromDb.map(fruit => ({
			id: extractIdFromPk(fruit.pk),
			name: fruit.name,
			price: fruit.price
		}))
		res.send(fruits)

	} catch(error) {
		handleError(error, res)
	}

})


// GET /fruits/:id
router.get<IdParam, Fruit | void>('/:id', async (req, res) => {
	// förbered kommando
	// skicka kommando till DynamoDB
	// om inget data hittas, statuskod 404
	// validera: parse Item(s) från databasen
	// skicka tillbaka Fruit objekt

	const id: string = req.params.id

	let getCommand = new GetCommand({
		TableName: myTable,
		Key: {
			pk: `FRUIT#${id}`,
			sk: 'meta'
		}
	})
	const result: GetCommandOutput = await db.send(getCommand)
	console.log('GET /fruits/:id result: ', result)
	// Genom att titta på utskriften i konsolen, kan vi se att result.Item inte finns om databasen inte hittar en frukt med givet id

	if( !result.Item ) {
		res.sendStatus(404)
		return
	}

	try {
		const fruitFromDb = z.parse(FruitFromDbSchema, result.Item)
		const fruit: Fruit = {
			id: extractIdFromPk(fruitFromDb.pk),
			name: fruitFromDb.name,
			price: fruitFromDb.price
		}
		res.send(fruit)

	} catch(error) {
		handleError(error, res)
	}
})


// PUT /fruits/:id
// Byta ut ett frukt-objekt i databasen
// Generiska parametrar: url-parametrar, response body, request body, request querystring
router.put<IdParam, void, Fruit>('/:id', async (req, res) => {
	// validera request body
	// förbereda kommando
	// skicka kommandot, vänta in svaret
	// kontrollera svaret: genomfördes ändringen? eller gick något fel?
	// 1. allt okej
	// 2. id matchar inget existerande objekt -> 404
	// 3. fel format på body -> 400

	let fruit: Fruit
	try {
		const body: unknown = req.body
		fruit = z.parse(FruitSchema, body)

	} catch(error) {
		// felaktigt frukt-objekt
		res.sendStatus(400)
		return
	}

	// UpdateCommand ändrar en Item i tabellen
	const id: string = req.params.id
	const updateCommand = new UpdateCommand({
		TableName: myTable,
		Key: {
			pk: `FRUIT#${id}`, // FRUIT#id
			sk: 'meta'
		},
		UpdateExpression: 'SET #name = :name, price = :price ',
		ConditionExpression: "attribute_exists(pk) AND attribute_exists(sk)",
		ExpressionAttributeNames: {
			'#name': 'name'  // name är ett reserverat ord, vi måste skapa ett alias
		},
		ExpressionAttributeValues: {
			':name': fruit.name,
			':price': fruit.price
		}
	})  // update command

	try {
		const result: UpdateCommandOutput = await db.send(updateCommand)
		console.log('Update result ', result)
		res.sendStatus(200)

	} catch(error) {
		if( error instanceof ConditionalCheckFailedException ) {
			// condition failed dvs. det fanns ingen item med rätt pk+sk
			res.sendStatus(404)
			return
		}
		console.log('Okänt fel vid update', getMessage(error))
		res.sendStatus(500)
	}
})
/*
Update result:  {
  '$metadata': {
    httpStatusCode: 200,
    requestId: 'UPHCGGMBI54TECBQDGA4TPLN2NVV4KQNSO5AEMVJF66Q9ASUAAJG',
    extendedRequestId: undefined,
    cfId: undefined,
    attempts: 1,
    totalRetryDelay: 0
  }
}
*/





function getMessage(error: any): string {
	const message: string = (error instanceof Error) ? error.message : String(error)
	return message
}

function handleError(error: any, res: Response): void {
	const message = (error instanceof Error) ? error.message : String(error)
	console.log('Felaktigt format på datan från databasen! ', message)
	res.sendStatus(500)
}

// Övning: skapa en funktion som kan göra om ett objekt från FruitFromDbSchema -> Fruit




function extractIdFromPk(pk: string): string {
	// "FRUIT#3" -> "3"
	// split ger oss denna lista: ['FRUIT', '3']
	return pk.split('#')[1] ?? ''
}
// split - delar upp en sträng i flera bitar
// slice - klipper ut en bit
// splice - ändrar en lista, tar bort och/eller lägger till

/*
Så här kan resultatet av ett ScanCommand se ut:
{
  "Items": [
    {
      "sk": "meta",
      "pk": "FRUIT#3",
      "price": 358,
      "name": "kokosnöt"
    },
    {
      "sk": "meta",
      "pk": "FRUIT#2",
      "price": 15,
      "name": "banan"
    },
    {
      "sk": "meta",
      "pk": "FRUIT#1",
      "price": 10,
      "name": "äpple"
    }
  ],
  "Count": 3,
  "ScannedCount": 3,
  "$metadata": {
    "httpStatusCode": 200,
    "requestId": "4G4I15I96KJLIBFBFB2D6BOJUJVV4KQNSO5AEMVJF66Q9ASUAAJG",
    "attempts": 1,
    "totalRetryDelay": 0
  }
}
  */

export default router
