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

    private silentMode: boolean = false;

    /**
     * ステータススキーマ全体を取得します。
     *
     * @returns {StatusSchema} 現在のステータススキーマ。
     */
    getSchema() {
        return this.schema;
    }

    /**
     * サイレントモードを設定します。
     *
     * @param {boolean} silent - サイレントモードを有効にする場合は `true`、無効にする場合は `false`。
     */
    setSilentMode(silent: boolean): void {
        this.silentMode = silent;
    }

    /**
     * サイレントモードの状態を取得します。
     *
     * @returns {boolean} サイレントモードが有効な場合は `true`、無効な場合は `false`。
     */
    getSilentMode(): boolean {
        return this.silentMode;
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
 * @param {boolean} [silent] - この呼び出しでのサイレントモード設定。`true` でコンソール出力を無効化、`false` で有効化、`undefined` でグローバル設定を使用。
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
 *
 * @example
 * // サイレントモードでログを出力（コンソール出力なし）
 * const status = { code: 404 };
 * const result = logStatus(status, { message: 'カードが見つかりませんでした' }, undefined, true);
 * console.log(result);
 * // コンソール出力なし、戻り値のみ
 */
const logStatus = <T extends object | unknown>(
    status: Status,
    message: T = {} as T,
    error?: unknown,
    silent?: boolean
): APISchema<T> => {
    const statusSchema = statusSchemaManager.getSchema();

    const statusType = Object.keys(statusSchema).find(
        (key) => statusSchema[key as keyof StatusSchema]?.[status.code]
    );

    let logMessage = status.message;

    if (logMessage === undefined || logMessage === null) {
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

    // サイレントモードの判定: 引数で指定された場合は優先、未指定の場合はグローバル設定を使用
    const isSilent = silent !== undefined ? silent : statusSchemaManager.getSilentMode();

    if (statusType === 'SUCCESS') {
        if (!isSilent) {
            console.log(`[SUCCESS] ${logMessage}`);
            console.log(`  └─`, message);
        }
        return { status, data: message };
    } else if (statusType === 'ERROR') {
        if (!isSilent) {
            console.error(`[ERROR] ${logMessage}`);
            if (error) {
                const errorMessage = error instanceof Error ? error.message : error;
                console.error(`  │─`, message);
                console.error(`  └─ ${errorMessage}`);
                return { status, error: errorMessage };
            }
            console.error(`  └─`, message);
        } else {
            if (error) {
                const errorMessage = error instanceof Error ? error.message : error;
                return { status, error: errorMessage };
            }
        }
        return { status, error: logMessage };
    } else if (statusType === 'WARN') {
        if (!isSilent) {
            console.warn(`[WARN] ${logMessage}`);
            console.warn(`  └─`, message);
        }
        return { status, data: message };
    } else {
        if (!isSilent) {
            console.error(`[ERROR] Invalid status code: ${status.code}`);
        }
        return { status, error: 'Internal Server Error' };
    }
}

export { logStatus, statusSchemaManager };