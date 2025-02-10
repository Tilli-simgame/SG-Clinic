import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { MongoClient } from "mongodb";
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

interface Appointment {
  petName: string;
  petType: string;
  breed: string;
  age: string;
  reason: string;
  appointmentDate: string;
  appointmentTime: string;
}

const jwksClient = new JwksClient({
    jwksUri: `https://${process.env.TENANT_NAME}.b2clogin.com/${process.env.TENANT_NAME}.onmicrosoft.com/${process.env.POLICY_NAME}/discovery/v2.0/keys`
});

async function getSigningKey(kid: string): Promise<string> {
    return new Promise((resolve, reject) => {
        jwksClient.getSigningKey(kid, (err, key) => {
            if (err) {
                console.error('Error getting signing key:', err);
                reject(err);
            } else if (!key) {
                console.error('No signing key found');
                reject(new Error("No signing key found"));
            } else {
                const signingKey = key.getPublicKey();
                if (!signingKey) {
                    console.error('Unable to get public key');
                    reject(new Error("Unable to get public key"));
                } else {
                    resolve(signingKey);
                }
            }
        });
    });
}

async function validateToken(token: string): Promise<{ isValid: boolean, scopes: string[] }> {
    try {
        const decodedToken: any = jwt.decode(token, { complete: true });
        if (!decodedToken) {
            console.error('Token could not be decoded');
            throw new Error("Invalid token");
        }

        console.log('Decoded token:', JSON.stringify(decodedToken, null, 2));
        console.log('Expected audience:', process.env.CLIENT_ID);
        console.log('Expected issuer:', `https://${process.env.TENANT_NAME}.b2clogin.com/${process.env.TENANT_NAME}.onmicrosoft.com/${process.env.POLICY_NAME}/v2.0/`);

        const kid = decodedToken.header.kid;
        const signingKey = await getSigningKey(kid);

        return new Promise((resolve, reject) => {
            jwt.verify(token, signingKey, {
                audience: process.env.CLIENT_ID,
                issuer: `https://${process.env.TENANT_NAME}.b2clogin.com/${process.env.TENANT_NAME}.onmicrosoft.com/${process.env.POLICY_NAME}/v2.0/`,
                algorithms: ['RS256']
            }, (err, decoded: any) => {
                if (err) {
                    console.error('Token validation error:', err);
                    resolve({ isValid: false, scopes: [] });
                } else {
                    console.log('Decoded and verified token:', JSON.stringify(decoded, null, 2));
                    const scopes = decoded.scp ? decoded.scp.split(' ') : [];
                    console.log('Scopes:', scopes);
                    resolve({ isValid: true, scopes });
                }
            });
        });
    } catch (error) {
        console.error('Token validation error:', error);
        return { isValid: false, scopes: [] };
    }
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));

    try {
        // Validate the token
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            context.res = {
                status: 401,
                body: "No authorization header provided"
            };
            return;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            context.res = {
                status: 401,
                body: "No token provided"
            };
            return;
        }

        console.log('Received token:', token);

        const validationResult = await validateToken(token);
        if (!validationResult.isValid) {
            context.res = {
                status: 401,
                body: "Invalid token"
            };
            return;
        }

        if (!validationResult.scopes.includes('appointments.write')) {
            context.res = {
                status: 403,
                body: "Token does not have the required scope"
            };
            return;
        }

        // Process the appointment
        const appointment: Appointment = req.body;

        // Validate appointment data
        if (!appointment || !appointment.petName || !appointment.petType || !appointment.appointmentDate || !appointment.appointmentTime) {
            context.res = {
                status: 400,
                body: "Invalid appointment data. Please provide all required fields."
            };
            return;
        }

        // Connect to MongoDB
        const client = await MongoClient.connect(process.env.COSMOSDB_CONNECTION_STRING as string);
        const database = client.db(process.env.COSMOSDB_DATABASE_NAME);
        const collection = database.collection('appointments');

        // Insert the appointment
        const result = await collection.insertOne(appointment);

        await client.close();

        if (result.acknowledged) {
            context.res = {
                status: 200,
                body: "Appointment booked successfully"
            };
        } else {
            throw new Error("Failed to insert appointment into database");
        }

    } catch (error: unknown) {
        context.log.error('Error:', error instanceof Error ? error.message : 'An unknown error occurred');
        context.res = {
            status: 500,
            body: error instanceof Error ? error.message : "An unknown error occurred while processing the appointment."
        };
    }
};

export default httpTrigger;