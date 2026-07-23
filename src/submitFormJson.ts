import { Alert } from 'react-native';

export type FormId = 'modus_operandi' | 'statement' | 'p21' | 'investigation_diary' | 'all_forms';

function getSubmitUrl(): string | undefined {
  return process.env.EXPO_PUBLIC_FORMS_SUBMIT_URL?.trim() || undefined;
}

/**
 * POSTs JSON to `EXPO_PUBLIC_FORMS_SUBMIT_URL` when set.
 * Body: `{ [formName]: payload }`.
 * If the env var is missing, shows an alert with a JSON preview (dev / no backend).
 */
export async function submitFormJson(formId: FormId, payload: Record<string, unknown>): Promise<void> {
  const url = getSubmitUrl();
  const body = JSON.stringify({
    [formId]: payload,
  });

  if (!url) {
    const preview = body.length > 1200 ? `${body.slice(0, 1200)}…` : body;
    Alert.alert(
      'Forms submit URL not set',
      `Add EXPO_PUBLIC_FORMS_SUBMIT_URL to your .env (Expo public env) to POST JSON to your API.\n\nPreview:\n${preview}`,
    );
    return;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body,
    });
    const text = await res.text();
    if (!res.ok) {
      Alert.alert('Submit failed', `${res.status} ${res.statusText}\n${text.slice(0, 500)}`);
      return;
    }
    Alert.alert('Submitted', `Server responded ${res.status}.`);
  } catch (e) {
    Alert.alert('Network error', e instanceof Error ? e.message : String(e));
  }
}
