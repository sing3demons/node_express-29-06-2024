import type { ILogger } from "../server/logger";
import AuthRepository from "./repository";

export default class AuthService {
    constructor(private readonly repository: AuthRepository) { }

    async getProfile(logger: ILogger) {
        logger.info('Get Profile service')
        return this.repository.getProfile(logger)
    }

    // async registerUser(user: User) {
    //     const existingUser = await this.repository.findOne({ email: user.email })
    //     if (existingUser) {
    //         throw new Error('User already exists')
    //     }
    //     return this.repository.insert(user)
    // }

    // async loginUser(user: User) {
    //     const existingUser = await this.repository.findOne({ email: user.email })
    //     if (!existingUser) {
    //         throw new Error('User not found')
    //     }
    //     if (existingUser.password !== user.password) {
    //         throw new Error('Invalid password')
    //     }
    //     return existingUser
    // }

}