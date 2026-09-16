import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { accessKey, secretAccessKey } from './keys.ts'


const client: DynamoDBClient = new DynamoDBClient({
	region: "eu-north-1",  // se till att använda den region som du använder för DynamoDB
	credentials: {
		accessKeyId: accessKey,
		secretAccessKey: secretAccessKey,
	},
});
// ?? kallas för nullish coalescing operator
const db: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client);

export default db
