import type { Response } from "express"


export function getMessage(error: any): string {
	const message: string = (error instanceof Error) ? error.message : String(error)
	return message
}

export function handleError(error: any, res: Response): void {
	const message = (error instanceof Error) ? error.message : String(error)
	console.log('Felaktigt format på datan från databasen! ', message)
	res.sendStatus(500)
}

// Övning: skapa en funktion som kan göra om ett objekt från FruitFromDbSchema -> Fruit




export function extractIdFromPk(pk: string): string {
	// "FRUIT#3" -> "3"
	// split ger oss denna lista: ['FRUIT', '3']
	return pk.split('#')[1] ?? ''
}
// split - delar upp en sträng i flera bitar
// slice - klipper ut en bit
// splice - ändrar en lista, tar bort och/eller lägger till
