import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { MapPin, Search, Trophy, PlayCircle } from "lucide-react";
import { loadGameProgress } from "../data/departments-data";

export default function Home() {
  const navigate = useNavigate();
  const savedProgress = loadGameProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900">
            KENDAI謎解きフェス2026
          </h1>
          <p className="text-xl text-gray-700">高崎健康福祉大学</p>
          <p className="text-lg text-gray-600">新入生歓迎 学内探索型謎解きイベント</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">イベント概要</CardTitle>
            <CardDescription className="text-base">
              学内のさまざまな号館を巡り、謎を解き明かそう!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">6つの学部を探索</h3>
                  <p className="text-gray-600">
                    好きな学部から謎解きをスタート！順番は自由です
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• 健康福祉学部（1,2,3号館）</li>
                    <li>• 保健医療学部（4,5号館）</li>
                    <li>• 薬学部（7号館）</li>
                    <li>• 人間発達学部/子ども教育学科（8,9号館）</li>
                    <li>• 農学部（10号館）</li>
                    <li>• 人間発達学部/心理学科（未定号館）</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Search className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">謎解き</h3>
                  <p className="text-gray-600">
                    階段の壁や掲示板に貼られた本学のイベント情報がヒント！<br />
                    サイトの指示に従って謎を解き進めよう
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Trophy className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">豪華景品をゲット！</h3>
                  <p className="text-gray-600">
                    1つの号館クリアごとに受付でお菓子がもらえます<br />
                    全6つクリアで豪華景品をゲット！
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">⚠️ 注意事項</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>景品を受け取る際はスクリーンショットではなく、実際の画面を見せてください</li>
                <li>各号館の謎解きは順不同でクリア可能です</li>
                <li>掲示物をよく観察しながら進めましょう</li>
              </ul>
            </div>

            {savedProgress && (
              <Button
                onClick={() => navigate(savedProgress.currentPath)}
                className="w-full text-lg h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <PlayCircle className="w-6 h-6 mr-2" />
                続きから再開（{savedProgress.savedAt}）
              </Button>
            )}

            <Link to="/select" className="block">
              <Button
                className="w-full text-lg h-14 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                variant={savedProgress ? "outline" : "default"}
              >
                {savedProgress ? "最初から学部選択へ" : "学部選択へ進む"}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500">
          ©️ 2026 高崎健康福祉大学 新入生歓迎委員会
        </p>
      </div>
    </div>
  );
}