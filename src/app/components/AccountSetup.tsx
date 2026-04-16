import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import {
  saveUserAccount,
  setClearedDepartmentsLocally,
} from "../data/departments-data";
import {
  registerAccountToServer,
  verifyAccountLogin,
  fetchClearedDepartmentsFromServer,
} from "../utils/supabase";

interface AccountSetupProps {
  onComplete: () => void;
}

type Mode = "signup" | "login";

export default function AccountSetup({ onComplete }: AccountSetupProps) {
  const [mode, setMode] = useState<Mode>("signup");
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !name.trim() || submitting) return;
    setSubmitting(true);
    setErrorMessage(null);
    const sid = studentId.trim();
    const nm = name.trim();

    if (mode === "signup") {
      // 新規登録: サーバーに送信 → ローカルに保存
      await registerAccountToServer(sid, nm);
      saveUserAccount(sid, nm);
      onComplete();
      return;
    }

    // ログイン: サーバーで学籍番号+氏名を検証
    const ok = await verifyAccountLogin(sid, nm);
    if (!ok) {
      setSubmitting(false);
      setErrorMessage(
        "該当するアカウントが見つかりません。学籍番号と氏名を確認してください。"
      );
      return;
    }
    // ログイン成功 → アカウント情報を保存してクリア状況を同期
    saveUserAccount(sid, nm);
    try {
      const clearedDeptIds = await fetchClearedDepartmentsFromServer(sid);
      setClearedDepartmentsLocally(clearedDeptIds);
    } catch (err) {
      console.error("Failed to sync progress on login:", err);
    }
    onComplete();
  };

  const handleSwitchMode = (next: Mode) => {
    if (submitting) return;
    setMode(next);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
            KENDAI謎解きフェス2026
          </h1>
          <p className="text-gray-600">
            {mode === "signup"
              ? "参加登録をしてイベントを始めよう！"
              : "ログインして進行状況を呼び出そう"}
          </p>
        </div>

        <Card className="shadow-xl overflow-hidden">
          {/* タブ切替 */}
          <div className="grid grid-cols-2 border-b">
            <button
              type="button"
              onClick={() => handleSwitchMode("signup")}
              className={`py-3 text-base font-semibold transition-colors ${
                mode === "signup"
                  ? "bg-blue-50 text-blue-900 border-b-2 border-blue-600"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              新規登録
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode("login")}
              className={`py-3 text-base font-semibold transition-colors ${
                mode === "login"
                  ? "bg-green-50 text-green-900 border-b-2 border-green-600"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              ログイン
            </button>
          </div>

          <CardHeader>
            <CardTitle className="text-xl text-center">
              {mode === "signup" ? "アカウント登録" : "アカウントログイン"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  学籍番号
                </label>
                <Input
                  type="text"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="例: 2610001"
                  className="text-lg h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  氏名
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="例: 健大 太郎"
                  className="text-lg h-12"
                  required
                />
                {mode === "login" && (
                  <p className="text-xs text-gray-500">
                    登録時と完全に同じ表記で入力してください
                  </p>
                )}
              </div>

              {errorMessage && (
                <p className="text-sm text-red-600 font-semibold bg-red-50 border border-red-200 rounded-md p-3">
                  {errorMessage}
                </p>
              )}

              <Button
                type="submit"
                disabled={!studentId.trim() || !name.trim() || submitting}
                className={`w-full h-14 text-lg ${
                  mode === "signup"
                    ? "bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                }`}
              >
                {submitting
                  ? mode === "signup"
                    ? "登録中..."
                    : "ログイン中..."
                  : mode === "signup"
                  ? "はじめる"
                  : "ログイン"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400">
          入力された情報はイベント参加者集計のために使用されます
        </p>
      </div>
    </div>
  );
}
