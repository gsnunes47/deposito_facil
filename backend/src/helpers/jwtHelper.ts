import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET as string

export function generateToken(payload: { userId: number; tenantId: number }) {
    return jwt.sign(payload, SECRET, { expiresIn: '8h' })
}