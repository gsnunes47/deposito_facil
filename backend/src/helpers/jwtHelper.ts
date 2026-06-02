import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET as string

export function generateToken(payload: { userId: number; tenantId: number; accessLevel: string }) {
    return jwt.sign(payload, SECRET, { expiresIn: '8h' })
}

export function verifyToken(token: string) {
    try {
        const decoded = jwt.verify(token, SECRET)
        return { valid: true, userId: (decoded as any).userId, tenantId: (decoded as any).tenantId, accessLevel: (decoded as any).accessLevel}
    } catch (error) {
        return { valid: false, error }
    }
}