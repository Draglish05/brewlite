type Options = { token?: string; headers?: Record<string, string> };

function buildHeaders(options: Options) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  return headers;
}

export async function postJson(path: string, body: unknown, options: Options = {}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(options),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function getJson(path: string, options: Options = {}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    headers: buildHeaders(options),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export function getErrorMessage(data: { message?: string | string[] }) {
  if (Array.isArray(data.message)) {
    return data.message.join(', ');
  }
  return data.message ?? 'Có lỗi xảy ra';
}
