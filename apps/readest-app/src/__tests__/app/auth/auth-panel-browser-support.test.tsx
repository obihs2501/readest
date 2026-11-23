/**
 * Provider sign-in (Google, Apple, GitHub, Discord) opens the provider's page in a browser.
 * A runtime with no browser to open (Readest Lite on a Kindle) shows only email sign-in.
 */

import { cleanup, render } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { afterEach, describe, expect, test, vi } from 'vitest';

const h = vi.hoisted(() => ({ appService: { isBrowserSupported: true } }));

vi.mock('@/context/EnvContext', () => ({ useEnv: () => ({ appService: h.appService }) }));
vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => (key: string, params?: Record<string, string>) =>
    key.replace('{{provider}}', params?.['provider'] ?? ''),
}));
vi.mock('next/image', () => ({ default: () => null }));
vi.mock('@/app/auth/components/EmailPasswordAuth', () => ({
  default: () => <form aria-label='email sign-in' />,
}));
vi.mock('@/app/auth/components/ReadestCloudOptIn', () => ({ default: () => null }));

import AuthPanel from '@/app/auth/components/AuthPanel';

const renderPanel = () =>
  render(<AuthPanel supabaseClient={{} as SupabaseClient} onProviderSignIn={vi.fn()} />);

afterEach(() => {
  cleanup();
});

describe('AuthPanel provider sign-in', () => {
  test('offers the providers where a browser can open', () => {
    h.appService.isBrowserSupported = true;
    const { queryByText, getByLabelText } = renderPanel();
    for (const provider of ['Google', 'Apple', 'GitHub', 'Discord']) {
      expect(queryByText(`Sign in with ${provider}`)).not.toBeNull();
    }
    expect(queryByText('or continue with email')).not.toBeNull();
    getByLabelText('email sign-in');
  });

  test('shows only email sign-in without a browser', () => {
    h.appService.isBrowserSupported = false;
    const { queryByText, getByLabelText } = renderPanel();
    for (const provider of ['Google', 'Apple', 'GitHub', 'Discord']) {
      expect(queryByText(`Sign in with ${provider}`), `Sign in with ${provider}`).toBeNull();
    }
    expect(queryByText('or continue with email'), 'the email divider').toBeNull();
    getByLabelText('email sign-in');
  });
});
