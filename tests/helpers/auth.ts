import { APIRequestContext, expect } from '@playwright/test';

const API_URL = 'http://localhost:8000/api';

export async function loginEcommerce(request: APIRequestContext) {
  const response = await request.post(`${API_URL}/auth/login_ecommerce`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    data: {
      email: 'camiloescar1995@gmail.com',
      password: '12345678',
    },
  });

  // DEBUG si falla
  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  return body.access_token || body.token;
}

export async function loginAdmin(request: APIRequestContext) {
  const response = await request.post(`${API_URL}/auth/login`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    data: {
      email: 'admin@admin.com',
      password: '12345678',
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  return body.access_token || body.token;
}
