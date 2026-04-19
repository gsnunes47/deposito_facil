import type { Prisma } from "@prisma/client";
import prisma from "../repositories/db.js";
import bcrypt from "bcrypt";

class UserDomain {
    
    async createUser(userObject: Prisma.UserCreateInput) {

        try {

            const data = {
                ...userObject,
                password: await bcrypt.hash(userObject.password, 10)
            };

            const userDb = await prisma.user.create({
                data: data
            })

            return {
                "code": 200,
                "message": "User created successfully",
                "user_id": userDb.id
            }
            
        } catch (error) {

            return {
                "code": 400,
                "message": "Error creating User",
                "error": error
            }

        }

    }

}

export default new UserDomain()