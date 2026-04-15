/** Supabase REST API を直接呼び出す軽量クライアント */

const SUPABASE_URL = "https://kbqsdmladecqxgejlriq.supabase.co";
const SUPABASE_KEY =
  "sb_publishable_zAJM2jddcjU-MSUL0CXXFQ_pR1w47YZ";

/** 参加者アカウントを Supabase に登録（既存の学籍番号は無視） */
export async function registerAccountToServer(
  studentId: string,
  name: string
): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
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
