import { logStatus } from '../src/logStatus';
import { statusSchemaManager } from '../src/logStatus';
import type { Status } from '../src/types';

describe('logStatus', () => {
  test('SUCCESS ステータスのログを出力する', () => {
    const status: Status = { code: 200 };
    const result = logStatus(status, { data: 'test data' });

    expect(result.status.code).toBe(200);
    expect(result.status.message).toBe('Success');
    expect(result.data).toEqual({ data: 'test data' });
  });

  test('ERROR ステータスのログを出力する', () => {
    const status: Status = { code: 404 };
    const result = logStatus(status, {}, 'Not Found');

    expect(result.status.code).toBe(404);
    expect(result.status.message).toBe('Not Found');
    expect(result.error).toBe('Not Found');
  });

  test('カスタムステータスを更新してログを出力する', () => {
    statusSchemaManager.updateStatus('SUCCESS', 201, 'Created');
    const status: Status = { code: 201 };
    const result = logStatus(status);

    expect(result.status.code).toBe(201);
    expect(result.status.message).toBe('Created');
  });
});