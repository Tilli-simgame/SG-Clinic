import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { MongoClient } from "mongodb"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const appointmentData = req.body;

    if (!appointmentData) {
        context.res = {
            status: 400,
            body: "Please pass appointment data in the request body"
        };
        return;
    }

    const connectionString = process.env.CosmosDBConnectionString;
    if (!connectionString) {
        context.res = {
            status: 500,
            body: "CosmosDB connection string is not configured"
        };
        return;
    }

    const client = new MongoClient(connectionString);

    try {
        await client.connect();
        const database = client.db("sgclinic");
        const collection = database.collection("appointments");

        // Add timestamp and user info to the appointment data
        appointmentData.createdAt = new Date();
        appointmentData.userId = req.headers['x-ms-client-principal-id'];
        appointmentData.userEmail = req.headers['x-ms-client-principal-name'];

        const result = await collection.insertOne(appointmentData);

        context.res = {
            status: 201,
            body: `Appointment created successfully! ID: ${result.insertedId}`
        };
    } catch (error) {
        context.log.error('Error creating appointment:', error);
        context.res = {
            status: 500,
            body: "An error occurred while creating the appointment."
        };
    } finally {
        await client.close();
    }
};

export default httpTrigger;