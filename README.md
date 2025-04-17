# logstatus

`logstatus` は、ステータスコードに基づいてログを出力し、API レスポンス形式のオブジェクトを生成する TypeScript パッケージです。

## 特徴

- ステータスコードに基づいたメッセージの自動生成
- カスタムステータスの追加・更新・削除が可能
- 成功、警告、エラーのログ出力をサポート
- TypeScript による型安全な設計

## インストール

```bash
npm install @shiki-01/logstatus
```

## 使用方法

### 基本的な使用例

```typescript
import { logStatus } from '@shiki-01/logstatus';

const status = { code: 200 };
const result = logStatus(status, { data: 'example data' });

console.log(result);
// 出力: { status: { code: 200, message: 'Success' }, data: { data: 'example data' } }
```

### エラーステータスのログ出力

```typescript
import { logStatus } from '@shiki-01/logstatus';

const status = { code: 404 };
const result = logStatus(status, {}, 'Not Found');

console.log(result);
// 出力: { status: { code: 404, message: 'Not Found' }, error: 'Not Found' }
```

### カスタムステータスの追加

```typescript
import { statusSchemaManager, logStatus } from '@shiki-01/logstatus';

statusSchemaManager.updateStatus('SUCCESS', 201, 'Created');

const status = { code: 201 };
const result = logStatus(status);

console.log(result);
// 出力: { status: { code: 201, message: 'Created' } }
```

## API ドキュメント

### `logStatus`

ステータスをログに出力し、API レスポンス形式のオブジェクトを返します。

#### パラメータ

- `status` (`Status`): ステータスオブジェクト。`code` はステータスコード、`message` はオプションのカスタムメッセージ。
- `message` (`T`): ステータスに関連付けられたデータ。デフォルトは空オブジェクト。
- `error` (`unknown`): エラーオブジェクトまたはエラーメッセージ（オプション）。

#### 戻り値

`APISchema<T>`: API レスポンス形式のオブジェクト。

#### 使用例

```typescript
const status = { code: 500 };
const result = logStatus(status, {}, 'Internal Server Error');
console.log(result);
// 出力: { status: { code: 500, message: 'Internal Server Error' }, error: 'Internal Server Error' }
```

### `statusSchemaManager`

ステータススキーマを管理するクラス。

#### メソッド

- `getSchema()`: 現在のステータススキーマを取得します。
- `getStatusMessage(type, code)`: 指定されたステータスタイプとコードに対応するメッセージを取得します。
- `updateStatus(type, code, message)`: 新しいステータスを追加または更新します。
- `removeStatus(type, code)`: 指定されたステータスを削除します。

## 開発者向け情報

### ビルド

TypeScript をコンパイルして `dist` ディレクトリに出力します。

```bash
npm run build
```

### テスト

`jest` を使用してテストを実行します。

```bash
npm test
```

## 貢献

バグ報告や機能リクエストは [GitHub Issues](https://github.com/shiki-01/logStatus/issues) で受け付けています。
