const accessKey: string = process.env.ACCESS_KEY!
const secretAccessKey: string = process.env.SECRET_ACCESS_KEY!

// console.log('Testar ENV: ', accessKey)
if( !accessKey || !secretAccessKey ) {
	console.log('Inga AWS-nycklar hittade! Kolla din .env-fil.')
	process.exit(1)  // Avsluta direkt, med valfri kod som inte är 0
}

export { accessKey, secretAccessKey }
