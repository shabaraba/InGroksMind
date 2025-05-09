import React, { useEffect, useState, useContext } from 'react';
import { VirtualUser } from '../data/virtualUsers';
import { StyleVariation } from '../data/styleVariations';
import { getTranslation } from '../i18n/translations';
import { LanguageContext } from '../pages/_app';
import PostInteractions from './PostInteractions';

interface ReplyRequestProps {
  user: VirtualUser;
  originalUser: VirtualUser;
  style: StyleVariation;
  isJapanese: boolean;
  customSeed?: string; // インタラクション数固定のためのカスタムシード値
}

const ReplyRequest: React.FC<ReplyRequestProps> = ({
  user,
  originalUser,
  style,
  isJapanese,
  customSeed
}) => {
  const { language } = useContext(LanguageContext);
  const t = getTranslation();
  const [styleName, setStyleName] = useState('');
  const [requestText, setRequestText] = useState('');

  // 言語変更時にスタイル名とリクエストテキストを更新
  useEffect(() => {
    const currentStyleName = isJapanese ? style.name_ja : style.name_en;
    setStyleName(currentStyleName);

    // 翻訳テキストを最新の言語で取得
    const currentT = getTranslation();
    setRequestText(currentT.factCheckRequest.replace('{style}', currentStyleName));
  }, [style, isJapanese, language]);

  return (
    <div className="tweet-container border-b border-gray-700 pl-12">
      <div className="flex items-start">
        <div
          className="mr-3 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
          style={{ backgroundColor: user.avatar }}
        >
          {user.name?.charAt(0) || user.username.charAt(0)}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-white">{user.name || (user.name_ja || user.name_en)}</h3>
              <p className="text-gray-400 text-sm">@{user.username} · {t.justNow}</p>
            </div>
            {/* アイコンは削除 */}
          </div>
          <p className="text-gray-400 text-sm mb-1">
            {isJapanese ? '返信先:' : 'Replying to:'} <span className="text-twitter-blue">@{originalUser.username}</span>
          </p>
          <div className="mt-1 text-white whitespace-pre-wrap">
            <span className="text-twitter-blue">@grok</span> {requestText}
          </div>

          {/* インタラクションボタン - ユーザー名とスタイル名およびカスタムシードをシードとして使用 */}
          <PostInteractions seed={`${user.username}-${style.id}-${customSeed || ''}`} />
        </div>
      </div>
    </div>
  );
};

export default ReplyRequest;