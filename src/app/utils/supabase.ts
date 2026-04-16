/** Supabase REST API を直接呼び出す軽量クライアント */

const SUPABASE_URL = "https://kbqsdmladecqxgejlriq.supabase.co";
const SUPABASE_KEY =
  "sb_publishable_zAJM2jddcjU-MSUL0CXXFQ_pR1w47YZ";

const baseHeaders = {
  "Content-Type": "application/json",
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

/** 参加者アカウントを Supabase に登録（既存の学籍番号は無視） */
export async function registerAccountToServer(
  studentId: string,
  name: string
): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/accounts`, {
      method: "POST",
      headers: {
        ...baseHeaders,
        // 既に同じ student_id があっても 409 で静かに失敗させる
        Prefer: "resolution=ignore-duplicates",
      },
      body: JSON.stringify({
        student_id: studentId,
        name,
        user_agent:
          typeof navigator !== "undefined" ? navigator.userAgent : null,
      }),
    });
    // 201 (created) も 200 系もOKとする
    return res.ok || res.status === 409;
  } catch (err) {
    console.error("Account registration failed:", err);
    return false;
  }
}

/** 学部（号館）のクリア記録を Supabase に送信する。
 *  (student_id, department_id) は主キーなので、同じ組み合わせは静かに無視される。 */
export async function recordClearedDepartmentToServer(
  studentId: string,
  departmentId: string
): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/cleared_departments`, {
      method: "POST",
      headers: {
        ...baseHeaders,
        Prefer: "resolution=ignore-duplicates",
      },
      body: JSON.stringify({
        student_id: studentId,
        department_id: departmentId,
      }),
    });
    return res.ok || res.status === 409;
  } catch (err) {
    console.error("Cleared department record failed:", err);
    return false;
  }
}

/** 学籍番号 + 氏名の組み合わせで既存アカウントを検証する。
 *  見つかれば true（ログイン成功）、見つからなければ false を返す。 */
export async function verifyAccountLogin(
  studentId: string,
  name: string
): Promise<boolean> {
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/accounts` +
      `?student_id=eq.${encodeURIComponent(studentId)}` +
      `&name=eq.${encodeURIComponent(name)}` +
      `&select=student_id&limit=1`;
    const res = await fetch(url, {
      method: "GET",
      headers: baseHeaders,
    });
    if (!res.ok) return false;
    const rows: Array<{ student_id: string }> = await res.json();
    return rows.length > 0;
  } catch (err) {
    console.error("Account login verification failed:", err);
    return false;
  }
}

/** サーバー上に保存されている、指定ユーザーのクリア済み学部IDリストを取得する。 */
export async function fetchClearedDepartmentsFromServer(
  studentId: string
): Promise<string[]> {
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/cleared_departments` +
      `?student_id=eq.${encodeURIComponent(studentId)}` +
      `&select=department_id`;
    const res = await fetch(url, {
      method: "GET",
      headers: baseHeaders,
    });
    if (!res.ok) return [];
    const rows: Array<{ department_id: string }> = await res.json();
    return rows.map(r => r.department_id);
  } catch (err) {
    console.error("Fetching cleared departments failed:", err);
    return [];
  }
}
