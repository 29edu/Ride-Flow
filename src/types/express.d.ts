
import type { JwtPayload } from "jsonwebtoken";

type Role = "admin" | 'user'

declare global {
    namespace Express  {
        interface Request {
            user?: JwtPayload & {
                id : string,
                email : string,
                role : string
            }
        }
    }
}

export {}