import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Home, CheckCircle2, PlayCircle, Lock, LogIn } from "lucide-react";
import {
  departments,
  getClearedDepartments,
  isAllDepartmentsCleared,
  loadGameProgress,
  isDepartmentUnlocked,
  unlockDepartment,
  saveUserAccount,
  setClearedDepartmentsLocally,
  type DepartmentData,
} from "../data/departments-data";
import {
  verifyAccountLogin,
  fetchClearedDepartmentsFromServer,
} from "../utils/supabase";
import { useEffect, useState } from "react";
import { useBgm } from "../context/BgmContext";

export default function DepartmentSelect() {
  const navigate = useNavigate();
  const [clearedDepts, setClearedDepts] = useState<string[]>([]);
  const [allCleared, setAllCleared] = useState(false);
  const [passwordDept, setPasswordDept] = useState<DepartmentData | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  // ログインモーダル用のステート
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStudentId, setLoginStudentId] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { switchTrack } = useBgm();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginStudentId.trim() || !loginName.trim() || loginSubmitting) return;
    setLoginSubmitting(true);
    setLoginError(null);
    const sid = loginStudentId.trim();
    const nm = loginName.trim();

    const ok = await verifyAccountLogin(sid, nm);
    if (!ok) {
      setLoginSubmitting(false);
      setLoginError(
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
    // 画面を再読み込みして全状態をリフレッシュ
    window.location.reload();
  };

  const handleOpenLoginModal = () => {
    setLoginStudentId("");
    setLoginName("");
    setLoginError(null);
    setShowLoginModal(true);
  };

  const handleDepartmentClick = (dept: DepartmentData) => {
    // パスワード付きの学部で未解除の場合
    if (dept.unlockPassword && !isDepartmentUnlocked(dept.id)) {
      setPasswordDept(dept);
      setPasswordInput("");
      setPasswordError(false);
      return;
    }
    navigate(`/department/${dept.id}/stage/1`);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordDept) return;
    if (passwordInput === passwordDept.unlockPassword) {
      unlockDepartment(passwordDept.id);
      const dept = passwordDept;
      setPasswordDept(null);
      setPasswordInput("");
      setRefreshKey(k => k + 1);
      navigate(`/department/${dept.id}/stage/1`);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  useEffect(() => {
    // 学部選択画面ではポケモンジムBGM
    switchTrack("gym");
  }, [switchTrack]);

  useEffect(() => {
    const updateClearStatus = () => {
      setClearedDepts(getClearedDepartments());
      setAllCleared(isAllDepartmentsCleared());
    };

    updateClearStatus();
    window.addEventListener('focus', updateClearStatus);

    return () => {
      window.removeEventListener('focus', updateClearStatus);
    };
  }, []);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
      blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
      green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-100 text-green-700" },
      purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-700" },
      yellow: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700" },
      orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-700" },
      pink: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", badge: "bg-pink-100 text-pink-700" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4 mr-2" />
            ホーム
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenLoginModal}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <LogIn className="w-4 h-4 mr-2" />
              ログイン
            </Button>
            <Badge variant="secondary" className="text-base px-4 py-2">
              {clearedDepts.length} / {departments.length} クリア
            </Badge>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
            学部選択
          </h1>
          <p className="text-gray-600">
            好きな学部から謎解きをスタートしよう！
          </p>
        </div>

        {/* 続きから再開 */}
        {(() => {
          const saved = loadGameProgress();
          if (!saved) return null;
          return (
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="text-3xl">📌</div>
                  <h2 className="text-xl font-bold text-orange-900">
                    セーブデータがあります
                  </h2>
                  <p className="text-gray-700 text-sm">
                    前回の保存: {saved.savedAt}
                  </p>
                  <Button
                    onClick={() => navigate(saved.currentPath)}
                    className="mt-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    続きから再開
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* 全クリアメッセージ */}
        {allCleared && (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="text-4xl">🎉</div>
                <h2 className="text-2xl font-bold text-yellow-900">
                  全学部クリア おめでとうございます！
                </h2>
                <p className="text-gray-700">
                  1号館受付でこの画面を提示して、景品を受け取ってください
                </p>
                <Button
                  onClick={() => navigate("/all-complete")}
                  className="mt-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                >
                  景品受け取り画面へ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 学部一覧 */}
        <div className="grid md:grid-cols-2 gap-4" key={refreshKey}>
          {departments.map((dept) => {
            const isCleared = clearedDepts.includes(dept.id);
            const colorClasses = getColorClasses(dept.color);
            const isPublic = dept.id === "health-welfare" || dept.id === "pharmacy" || dept.id === "child-education";
            const hasPassword = !!dept.unlockPassword;
            const isUnlocked = isDepartmentUnlocked(dept.id);
            const isAvailable = isPublic || (hasPassword && isUnlocked);

            return (
              <Card
                key={dept.id}
                onClick={() => {
                  if (isAvailable || hasPassword) handleDepartmentClick(dept);
                }}
                className={`transition-all ${
                  isAvailable || hasPassword ? "hover:shadow-lg cursor-pointer" : "opacity-70"
                } ${isCleared ? "border-2 border-green-400" : ""}`}
              >
                <CardHeader className={`${colorClasses.bg} border-b ${colorClasses.border} relative`}>
                  {isCleared && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600 fill-green-100" />
                    </div>
                  )}
                  {!isPublic && !isUnlocked && (
                    <div className="absolute top-4 right-4 flex items-center gap-1">
                      {hasPassword && <Lock className="w-4 h-4 text-gray-600" />}
                      <Badge className="bg-gray-500 text-white text-xs">
                        Coming Soon
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{dept.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{dept.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {dept.buildings}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {isAvailable ? (
                    <>
                      <div className="flex items-center justify-between">
                        <Badge className={colorClasses.badge}>
                          {dept.keywordMode ? "キーワード収集" : `${dept.stages.length}つの謎`}
                        </Badge>
                        {isCleared && (
                          <Badge className="bg-green-100 text-green-700">
                            クリア済み ✓
                          </Badge>
                        )}
                      </div>
                      <Button
                        className="w-full"
                        variant={isCleared ? "outline" : "default"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDepartmentClick(dept);
                        }}
                      >
                        {isCleared ? "もう一度挑戦" : "謎解きスタート"}
                      </Button>
                    </>
                  ) : hasPassword ? (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-500 font-semibold">
                        4月14日以降に毎日公開予定！
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-500 font-semibold">
                        4月14日以降に毎日公開予定！
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ログインモーダル */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <Card className="max-w-sm w-full shadow-2xl border-2 border-green-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-green-700" />
                  <CardTitle className="text-lg">ログイン</CardTitle>
                </div>
                <CardDescription>
                  学籍番号と氏名を入力すると、<br />
                  サーバーに保存された進行状況を呼び出せます
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      学籍番号
                    </label>
                    <Input
                      type="text"
                      value={loginStudentId}
                      onChange={(e) => {
                        setLoginStudentId(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="例: 2610001"
                      className="text-lg h-12"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      氏名
                    </label>
                    <Input
                      type="text"
                      value={loginName}
                      onChange={(e) => {
                        setLoginName(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="例: 健大 太郎"
                      className="text-lg h-12"
                    />
                    <p className="text-xs text-gray-500">
                      登録時と完全に同じ表記で入力してください
                    </p>
                  </div>
                  {loginError && (
                    <p className="text-sm text-red-600 font-semibold bg-red-50 border border-red-200 rounded-md p-3">
                      {loginError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowLoginModal(false)}
                      disabled={loginSubmitting}
                    >
                      キャンセル
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      disabled={
                        !loginStudentId.trim() ||
                        !loginName.trim() ||
                        loginSubmitting
                      }
                    >
                      {loginSubmitting ? "ログイン中..." : "ログイン"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* パスワード入力モーダル */}
        {passwordDept && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <Card className="max-w-sm w-full shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-700" />
                  <CardTitle className="text-lg">パスワードを入力</CardTitle>
                </div>
                <CardDescription>
                  {passwordDept.name} に参加するには<br />
                  パスワードが必要です
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <Input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="パスワード"
                    className="text-lg h-12"
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-sm text-red-600 font-semibold">
                      パスワードが違います
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setPasswordDept(null)}
                    >
                      キャンセル
                    </Button>
                    <Button type="submit" className="flex-1">
                      参加する
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900">💡 ヒント</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• すべての学部をクリアすると、1号館受付で景品を受け取れます</li>
                <li>• 階段の壁や掲示板の情報がヒントになっています</li>
                <li>• 順番は自由なので、興味のある学部から始めましょう</li>
              </ul>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}