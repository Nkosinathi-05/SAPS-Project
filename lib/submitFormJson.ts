import { Alert } from "react-native";

export type FormId =
  | "modusOperandi"
  | "statement"
  | "p21"
  | "investigationDiary"
  | "all_forms";

const BASE_URL = "http://127.0.0.1:5000";

function getSubmitUrl(formId: FormId): string {
  return `${BASE_URL}/cases`;
}

export type SubmitFormResult = {
  ok: boolean;
  status: number;
  data?: any;
};

export async function submitFormJson(
  formId: FormId,
  payload: Record<string, unknown>,
  extra?: Record<string, unknown>,
  extra2?: Record<string, unknown>,
): Promise<SubmitFormResult> {
  const url = getSubmitUrl(formId);
  const body = JSON.stringify({
    [formId]: payload,
    ...extra,
    ...extra2,
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body,
    });

    const text = await res.text();

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = undefined; // response wasn't JSON (e.g. ngrok warning page, HTML error page)
    }

    if (!res.ok) {
      Alert.alert(
        "Submit failed",
        `${res.status} ${res.statusText}\n${text.slice(0, 500)}`,
      );
      return { ok: false, status: res.status, data };
    }

    return { ok: true, status: res.status, data };
  } catch (e) {
    Alert.alert("Network error", e instanceof Error ? e.message : String(e));
    return { ok: false, status: 0 };
  }
}
