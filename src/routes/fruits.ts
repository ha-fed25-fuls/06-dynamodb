
import express, { type Router } from 'express'
import type { Fruit } from '../types.ts'

const router: Router = express.Router()


// GET /fruits
// vi behöver inte ha med "/fruits" eftersom den finns i server.ts
router.get<{}, Fruit[]>('/', (req, res) => {
	
})


export default router
