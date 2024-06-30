import type { Collection, Document, Filter, FindOptions } from "mongodb"
import type Database from "../db"
import type { ILogger } from "../server/logger"

export default class AuthRepository {
    private readonly collection = 'auth'
    private readonly dbName = 'auth'
    private readonly DB: Collection
    constructor(private readonly db: Database) {
        this.DB = db.getDatabase(this.dbName).getCollection(this.collection)
    }

    async getProfile(logger: ILogger) {
        logger.info('Get Profile repository')
        return [{
            name: 'John Doe',
            email: "sing@dev.com"
        }]
    }

    async insert<T extends object>(doc: T) {
        return this.DB.insertOne(doc)
    }

    async find<T extends object>(query: T, options?: FindOptions) {
        return this.DB.find<T>(query, options).toArray()
    }

    async findOne<T extends object>(filter: Filter<Document>) {
        return this.DB.findOne<T>(filter)
    }

    async update<T extends object>(query: T, update: T) {
        return this.DB.updateOne(query, update)
    }

    async delete<T extends object>(query: T) {
        return this.DB.deleteOne(query)
    }
}