import { randomUUID } from "node:crypto"
import { DeleteCommand, GetCommand, PutCommand, ScanCommand, UpdateCommand, type GetCommandOutput, type ScanCommandOutput, type UpdateCommandOutput } from "@aws-sdk/lib-dynamodb";
import express, { type Response, type Router } from 'express'
import { FruitFromDbSchema, FruitListFromDbSchema, FruitSchema, FruitWithoutIdSchema, type Fruit, type FruitWithoutId } from '../types.ts'
import db from '../aws.ts'
import * as z from 'zod'
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { extractIdFromPk, getMessage, handleError } from "../helpers.ts";

const router: Router = express.Router()

const myTable: string = 'fed25-fruits'  // din tabell

type IdParam = { id: string; }
type IdResponse = { id: string; }



// GET /fruits
// vi behöver inte ha med "/fruits" eftersom den finns i server.ts
router.get<{}, Fruit[] | void>('/', async (req, res) => {
	// hämta alla items i en tabell - VARNING! Långsam, använd andra metoder om tabellen växer
	let scanCommand = new ScanCommand({
		TableName: myTable
	})
	try {
		const result: ScanCommandOutput = await db.send(scanCommand)
		// console.log('GET /fruits, Lyckad hämtning? ', result)
		// result är ett objekt som innehåller Items (optional)

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
	try {
		const result: GetCommandOutput = await db.send(getCommand)
		// console.log('GET /fruits/:id result: ', result)
		// Genom att titta på utskriften i konsolen, kan vi se att result.Item inte finns om databasen inte hittar en frukt med givet id

		if( !result.Item ) {
			res.sendStatus(404)
			return
		}

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


// POST /fruits
// Lägga till ett nytt frukt-objekt i databasen
// Generiska parametrar: url-parametrar, response body, request body, request querystring
router.post<{}, IdResponse, FruitWithoutId>('/', async (req, res) => {
	// validera body
	// skapa kommando, skicka till dynamodb
	// vad får vi för svar?
	// svara med vårt nya id

	try {
		const body: FruitWithoutId = FruitWithoutIdSchema.parse(req.body)

		// Vi behöver generera ett unikt id
		// Aktuell tid fungerar så länge vi kör koden helt i Express. Om vi använder Lambda (serverless) kan däremot två endpoints köras samma millisekund och vi får en kollision - två items med samma id. randomUUID är därför bättre.
		const id = randomUUID()
		// const id: string = String(Date.now())

		const command = new PutCommand({
			TableName: myTable,
			Item: {
				pk: `FRUIT#${id}`,
				sk: `meta`,
				...body
			}
		})
		const result = await db.send(command)
		// Vi behöver faktiskt inte göra något med svaret
		// console.log(`POST fruit, result from db: `, result)

		res.send({ id: id })

	} catch(error) {
		console.log('Okänt fel vid post', getMessage(error))
		res.sendStatus(400)
	}
})



// DELETE /fruits/:id
// Ta bort ett frukt-objekt
// Generiska parametrar: url-parametrar, response body, request body, request querystring
router.delete<IdParam>('/:id', async (req, res) => {
	// validera url-parametern, req.params.id
	// förbered kommando, skicka till dynamodb
	// svara med statuskod

	// Vi vet att id är en icke-tom sträng - behöver inte valideras ytterligare
	const id: string = req.params.id

	const command = new DeleteCommand({
		TableName: myTable,
		Key: {
			pk: `FRUIT#${id}`,
			sk: 'meta'
		},
		ReturnValues: "ALL_OLD"  // ifall vi vill få tillbaka värdet som fanns innan vi tog bort det
	})
	const result = await db.send(command)
	// console.log(`DELETE response from db:`, result)

	// ALL_OLD fyller i result.Attributes - vi behöver det för att avgöra om vi lyckades ta bort en Item eller om det inte fanns en Item med vårt id
	if( result.Attributes ) {
		// tog bort
		res.sendStatus(204)  // no content
	} else {
		// hittade inget att ta bort
		res.sendStatus(404)  // not found
	}
})


export default router
