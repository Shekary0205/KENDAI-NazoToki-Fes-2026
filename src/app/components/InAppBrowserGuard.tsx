import { useEffect, useState } from "react";

/** アプリ内ブラウザ（LINE, Instagram, Facebook, Twitter 等）を検出 */
function isInAppBrowser(): boolean {
  const ua = navigator.userAgent || navigator.vendor || "";
  const inAppPatterns = [
    /Line\//i,
    /LIFF/i,
    /Instagram/i,
    /FBAN|FBAV/i, // Facebook
    /Twitter/i,
    /MicroMessenger/i, // WeChat
    /Snapchat/i,
  ];
  return inAppPatterns.some((pattern) => pattern.test(ua));
}

function openInDefaultBrowser() {
  const url = window.location.href;
  const ua = navigator.userAgent || "";

  // Android: intent スキームで Chrome に飛ばす
  if (/android/i.test(ua)) {
    const intentUrl = `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;end`;
    window.location.href = intentUrl;
    return;
  }

  // iOS: Safari で開く試み
  // window.open は多くのアプリ内ブラウザでブロックされるため
  // ユーザーに手動操作を促すケースもある
  window.open(url, "_system");
}

export default function InAppBrowserGuard() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isInAppBrowser()) {
      // 自動でデフォルトブラウザへ遷移を試みる
      openInDefaultBrowser();
      // 遷移できなかった場合にバナーを表示
      const timer = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
        <div className="text-center space-y-2">
          <div className="text-4xl">🌐</div>
          <h2 className="text-xl font-bold text-gray-900">
            ブラウザで開いてください
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            アプリ内ブラウザでは一部の機能（BGM再生・進行保存など）が正しく動作しません。
            <br />
            <strong>デフォルトのブラウザ</strong>で開き直してください。
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900 font-semibold mb-2">開き方</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              <strong>iPhone:</strong> 右下の「…」や共有ボタン →「Safariで開く」
            </li>
            <li>
              <strong>Android:</strong> 右上の「⋮」→「ブラウザで開く」
            </li>
          </ul>
        </div>

        <button
          onClick={() => openInDefaultBrowser()}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-base"
        >
          ブラウザで開く
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="w-full text-sm text-gray-500 underline"
        >
          このまま続ける（非推奨）
        </button>
      </div>
    </div>
  );
}
