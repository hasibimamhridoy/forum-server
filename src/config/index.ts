import dotenv from 'dotenv'
import { Secret } from 'jsonwebtoken'
import path from 'path'
dotenv.config({ path: path.join(process.cwd(), '.env') })

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  default_role: 'user',
  default_password: 'user',
  jwt: {
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY as Secret,
    JWT_ACCESS_TOKEN_EXPIRESIN: process.env.JWT_ACCESS_TOKEN_EXPIRESIN as string,
    JWT_REFRESS_TOKEN_EXPIRESIN: process.env.JWT_REFRESS_TOKEN_EXPIRESIN as string
  },
  bcrypt: {
    SALT_ROUNDS: process.env.SALT_ROUNDS as string
  }
}
