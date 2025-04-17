type Status = {
    code: number
    message?: string,
}

/**
 * API のレスポンスのスキーマ
 */
type APISchema<T = object | null> = {
    status: Status
    data?: T
    error?: string | Error | unknown
}

type StatusSchema = {
    SUCCESS: Record<number, { message: string }>
    WARN: Record<number, { message: string }>
    ERROR: Record<number, { message: string }>
}

export type { Status, APISchema, StatusSchema }