import type { APISchema, Status, StatusSchema } from './types'

class StatusSchemaManager {
    private schema: StatusSchema = {
        SUCCESS: {
            200: {
                message: 'Success'
            }
        },
        WARN: {
            300: {
                message: 'Warning'
            },
            301: {
                message: 'Redirect'
            },
            302: {
                message: 'Found'
            },
            304: {
                message: 'Not Modified'
            }
        },
        ERROR: {
            400: {
                message: 'Bad Request'
            },
            401: {
                message: 'Unauthorized'
            },
            403: {
                message: 'Forbidden'
            },
            404: {
                message: 'Not Found'
            },
            500: {
                message: 'Internal Server Error'
            }
        }
    };

    /**
     * ステータススキーマ全体を取得します。
     *
     * @returns {StatusSchema} 現在のステータススキーマ。
     */
    getSchema() {
        return this.schema;
    }

    /**
     * 指定されたステータスタイプとコードに対応するメッセージを取得します。
     *
     * @param {keyof StatusSchema} type - ステータスタイプ（SUCCESS, WARN, ERROR）。
     * @param {number} code - ステータスコード。
     * @returns {string | undefined} 対応するメッセージ。存在しない場合は `undefined`。
     */
    getStatusMessage(type: keyof StatusSchema, code: number): string | undefined {
        return this.schema[type]?.[code]?.message;
    }

    /**
     * ステータススキーマに新しいステータスを追加または更新します。
     *
     * @param {keyof StatusSchema} type - ステータスタイプ（SUCCESS, WARN, ERROR）。
     * @param {number} code - ステータスコード。
     * @param {string} message - ステータスに対応するメッセージ。
     */
    updateStatus(type: keyof StatusSchema, code: number, message: string): void {
        if (!this.schema[type]) {
            this.schema[type] = {};
        }
        this.schema[type][code] = { message };
    }

    /**
     * ステータススキーマから指定されたステータスを削除します。
     *
     * @param {keyof StatusSchema} type - ステータスタイプ（SUCCESS, WARN, ERROR）。
     * @param {number} code - 削除するステータスコード。
     */
    removeStatus(type: keyof StatusSchema, code: number): void {
        if (this.schema[type]) {
            delete this.schema[type][code];
            if (Object.keys(this.schema[type]).length === 0) {
                delete this.schema[type];
            }
        }
    }
}

const statusSchemaManager = new StatusSchemaManager();

/**
 * ステータスをログに出力し、APIレスポンス形式のオブジェクトを返します。
 *
 * @template T - レスポンスデータの型
 * @param {Status} status - ログに出力するステータスオブジェクト。`code` はステータスコード、`message` はオプションのカスタムメッセージ。
 * @param {T} [message={}] - ステータスに関連付けられたデータ。オブジェクトまたは任意の値を指定可能。
 * @param {unknown} [error] - エラーが発生した場合のエラーオブジェクトまたはエラーメッセージ（オプション）。
 * @returns {APISchema<T>} APIレスポンス形式のオブジェクト。`status` フィールドにステータス情報を含み、`data` または `error` フィールドを持つ。
 *
 * @example
 * // 成功ステータスのログを出力
 * const status = { code: 200 };
 * const result = logStatus(status, { data: 'example data' });
 * console.log(result);
 * // 出力: { status: { code: 200, message: 'Success' }, data: { data: 'example data' } }
 *
 * @example
 * // エラーステータスのログを出力
 * const status = { code: 404 };
 * const result = logStatus(status, {}, 'Not Found');
 * console.log(result);
 * // 出力: { status: { code: 404, message: 'Not Found' }, error: 'Not Found' }
 */
const logStatus = <T extends object | unknown>(
    status: Status,
    message: T = {} as T,
    error?: unknown
): APISchema<T> => {
    const statusSchema = statusSchemaManager.getSchema();

    const statusType = Object.keys(statusSchema).find(
        (key) => statusSchema[key as keyof StatusSchema]?.[status.code]
    );

    let logMessage = status.message;

    if (!logMessage) {
        if (statusType && statusSchema[statusType as keyof StatusSchema]?.[status.code]) {
            logMessage = statusSchema[statusType as keyof StatusSchema][status.code]?.message;
        } else {
            switch (statusType) {
                case 'SUCCESS':
                    logMessage = 'Success';
                    break;
                case 'WARN':
                    logMessage = 'Warning';
                    break;
                case 'ERROR':
                    logMessage = 'Error';
                    break;
                default:
                    logMessage = 'Unknown status';
                    break;
            }
        }
    }

    status = {
        code: status.code,
        message: logMessage
    }

    if (statusType === 'SUCCESS') {
        console.log(`[SUCCESS] ${logMessage}`);
        return { status, data: message };
    } else if (statusType === 'ERROR') {
        console.error(`[ERROR] ${logMessage}`);
        if (error) {
            const errorMessage = error instanceof Error ? error.message : error;
            console.error(`  └─ ${errorMessage}`);
            return { status, error: errorMessage };
        }
        return { status, error: logMessage };
    } else if (statusType === 'WARN') {
        console.warn(`[WARN] ${logMessage}`);
        return { status, data: message };
    } else {
        console.error(`[ERROR] Invalid status code: ${status.code}`);
        return { status, error: 'Internal Server Error' };
    }
}

export { logStatus, statusSchemaManager };