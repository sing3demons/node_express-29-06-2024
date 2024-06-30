import { MongoClient } from 'mongodb'


export default class Database {
    private readonly client: MongoClient
    constructor(private url: string) {
        this.client = new MongoClient(this.url)
    }

    async connect() {
        await this.client.connect()
        console.log('Connected to MongoDB')

    }

    ping = async () => {
        const pong = await this.client.db().command({ ping: 1 })
        return pong
    }

    async disconnect() {
        await this.client.close()
    }

    getCollection(name: string) {
        return this.client.db().collection(name)
    }

    async createCollection(name: string) {
        return this.client.db().createCollection(name)
    }

    async dropCollection(name: string) {
        return this.client.db().dropCollection(name)
    }

    async listCollections() {
        return this.client.db().listCollections().toArray()
    }

    async listDatabases() {
        return this.client.db().admin().listDatabases()
    }

    async dropDatabase() {
        return this.client.db().dropDatabase()
    }

    async createDatabase(name: string) {
        return this.client.db(name).createCollection(name)
    }

    getDatabase(name: string) {
        this.client.db(name)
        return this
    }

    async getCollectionFromDatabase(dbName: string, collectionName: string) {
        return this.client.db(dbName).collection(collectionName)
    }

    async createCollectionInDatabase(dbName: string, collectionName: string) {
        return this.client.db(dbName).createCollection(collectionName)
    }
}