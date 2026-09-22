// import och konfiguration
// middleware
// endpoints
// starta servern

import express, { type Express, type RequestHandler } from 'express'
import type { Server } from 'node:http'
import fruitsRouter from './routes/fruits.ts'
import reviewsRouter from './routes/reviews.ts'
import { formatTimestamp } from './timeUtilities.ts'


const app: Express = express()
const port: number = 3003


// middleware
const logger: RequestHandler = (req, res, next) => {
	const now = formatTimestamp()
	console.log(`${now}  ${req.method}  ${req.url}`)
	next()
}
app.use('/', logger)
app.use(express.json())

// endpoints
app.use('/fruits', fruitsRouter)
app.use('/reviews', reviewsRouter)


const server: Server = app.listen(port, () => {
	console.log(`Server is listening on port ${port}...`)
})

server.on('error', (err: NodeJS.ErrnoException) => {
    if( err.code === 'EADDRINUSE') {
        console.log(`Port ${port} är upptagen, välj en annan!`)
    } else {
        console.error(err)
    }
})

