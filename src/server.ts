// import och konfiguration
// middleware
// endpoints
// starta servern

import express, { type Express } from 'express'
import type { Server } from 'node:http'
import fruitsRouter from './routes/fruits.ts'

const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY
// console.log('Testar ENV: ', accessKey)
if( !accessKey || !secretAccessKey ) {
	console.log('Inga AWS-nycklar hittade! Kolla din .env-fil.')
	process.exit(0)  // Avsluta direkt
}

const app: Express = express()
const port: number = 3003


app.use('/fruits', fruitsRouter)


const server: Server = app.listen(port, () => {
	console.log(`Server is listening on port ${port}...`)
})

server.on('error', (err: any) => {
    if( err.code === 'EADDRINUSE') {
        console.log(`Port ${port} är upptagen, välj en annan!`)
    } else {
        console.error(err)
    }
})

// TODO: fixa any
