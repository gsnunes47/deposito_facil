import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET as string

export function generateToken(payload: { userId: number; tenantId: number }) {
    return jwt.sign(payload, SECRET, { expiresIn: '8h' })
}

export function verifyToken(token: string) {
    try {
        const decoded = jwt.verify(token, SECRET)
        return { valid: true, decoded }
    } catch (error) {
        return { valid: false, error }
    }
}