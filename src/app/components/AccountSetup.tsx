import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { saveUserAccount } from "../data/departments-data";

interface AccountSetupProps {
  onComplete: () => void;
}

export default function AccountSetup({ onComplete }: AccountSetupProps) {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !name.trim()) return;
    saveUserAccount(studentId.trim(), name.trim());
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
            KENDAI謎解きフェス2026
          </h1>
          <p className="text-gray-600">
            参加登録をしてイベントを始めよう！
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-center">アカウント登録</CardTitle>
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
                  onChange={(e) => setStudentId(e.target.value)}
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
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: 健大 太郎"
                  className="text-lg h-12"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={!studentId.trim() || !name.trim()}
                className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                はじめる
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400">
          入力された情報はこの端末内にのみ保存されます
        </p>
      </div>
    </div>
  );
}
