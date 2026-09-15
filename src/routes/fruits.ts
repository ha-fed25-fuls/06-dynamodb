import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, type ScanCommandOutput } from "@aws-sdk/lib-dynamodb";
import express, { type Router } from 'express'
import type { Fruit } from '../types.ts'

const router: Router = express.Router()



const client: DynamoDBClient = new DynamoDBClient({
	region: "eu-north-1",  // se till att använda den region som du använder för DynamoDB
	credentials: {
		accessKeyId: process.env.ACCESS_KEY ?? '',
		secretAccessKey: process.env.SECRET_ACCESS_KEY ?? '',
	},
});
// ?? kallas för nullish coalescing operator
const db: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client);
const myTable: string = 'fed25-fruits'  // din tabell



type ScanResult = Record<string, any>[] | undefined

// GET /fruits
// vi behöver inte ha med "/fruits" eftersom den finns i server.ts
router.get<{}, Fruit[]>('/', async (req, res) => {
	// hämta alla items i en tabell - VARNING! Långsam, använd andra metoder om tabellen växer
	let scanCommand = new ScanCommand({
		TableName: myTable
	})
	const result: ScanCommandOutput = await db.send(scanCommand)
	console.log('GET /fruits, Lyckad hämtning? ', result)
	// result är ett objekt som innehåller Items (optional)
	// TODO: validera Items (med Zod)
	
	// GÖR INTE SÅ HÄR - använd zod schema parse
	res.send(result.Items as unknown as Fruit[])
})

/*
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
