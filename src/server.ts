// import och konfiguration
// middleware
// endpoints
// starta servern

import express, { type Express } from 'express'
import type { Server } from 'node:http'

const app: Express = express()
const port: number = 3003



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
