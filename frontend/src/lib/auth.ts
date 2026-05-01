import { User } from './types';

export function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sm_token', token);
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sm_token');
  }
  return null;
}

export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sm_token');
    localStorage.removeItem('sm_user');
  }
}

export function saveUser(user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sm_user', JSON.stringify(user));
  }
}

export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('sm_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}
