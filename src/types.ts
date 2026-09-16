import * as z from 'zod'


// export type Fruit = {
// 	id: string;
// 	name: string;
// 	price: number;
// }
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


/*
// ändra en item
let result = db.send(new UpdateCommand({
	TableName: myTable,
	Key: { yourPartitionKeyName: 'värdet på PK för den item som ska ändras' },
	UpdateExpression: 'SET #dt = :d, score = :s',
	ExpressionAttributeNames: {
		'#dt': 'date'  // använd om man inte kan skriva t.ex. "date" direkt eftersom det är ett reserverat ord
	},
	ExpressionAttributeValues: {
		// Detta är alla fält som ska ändras
		':d': Date.now(),
		':s': 500
	}
})
*/