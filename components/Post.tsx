import React, { useContext, useEffect, useState } from 'react';
import { VirtualUser } from '../data/virtualUsers';
import { getTranslation } from '../i18n/translations';
import { LanguageContext } from '../pages/_app';
import PostInteractions from './PostInteractions';

interface PostProps {
  user: VirtualUser;
  content: string;
  timestamp?: string;
  isReply?: boolean;
  replyToUser?: string;
  className?: string;
  postId?: string; // 投稿を識別する一意のID（インタラクション数の固定に使用）
}

const Post: React.FC<PostProps> = ({
  user,
  content,
  timestamp,
  isReply = false,
  replyToUser,
  className = '',
  postId = Math.random().toString(36).substring(2, 8) // デフォルトの一意のID
}) => {
  const { isJapanese } = useContext(LanguageContext);
  const t = getTranslation();

  return (
    <div className={`tweet-container border-b border-gray-700 ${className}`}>
      <div className="flex items-start">
        <div 
          className="mr-3 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
          style={{ backgroundColor: user.avatar }}
        >
          {user.name.charAt(0)}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-white">{user.name}</h3>
              <p className="text-gray-400 text-sm">@{user.username} · {timestamp || t.justNow}</p>
            </div>
            {/* アイコンは削除 */}
          </div>
          {isReply && replyToUser && (
            <p className="text-gray-400 text-sm mb-1">
              返信先: <span className="text-twitter-blue">@{replyToUser}</span>
            </p>
          )}
          <div className="mt-1 text-white whitespace-pre-wrap">
            {content}
          </div>

          {/* インタラクションボタン - 投稿IDとユーザー名をシードとして使用 */}
          <PostInteractions seed={`${user.username}-${postId}`} />
        </div>
      </div>
    </div>
  );
};

export default Post;