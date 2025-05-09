import React from 'react';
import { StyleVariation } from '../data/styleVariations';
import { GrokUser, VirtualUser } from '../data/virtualUsers';
import getTranslation from '../i18n/translations';

interface ReplyRequestProps {
  style: StyleVariation;
  virtualUser: VirtualUser;
  requestUser: VirtualUser; // ファクトチェックを依頼するユーザー
}

const ReplyRequest: React.FC<ReplyRequestProps> = ({ style, virtualUser, requestUser }) => {
  const t = getTranslation();
  const isJapanese = navigator.language.startsWith('ja');
  return (
    <div className="tweet-container tweet-border pl-12">
      <div className="flex">
        <div className="mr-3">
          <div className={`w-12 h-12 rounded-full ${requestUser.avatarColor} flex items-center justify-center`}>
            <span className="text-lg font-bold">{requestUser.avatarInitial}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-bold mr-2">{isJapanese ? requestUser.name_ja : requestUser.name_en}</span>
            <span className="text-gray-500">@{requestUser.username} · {t.justNow}</span>
          </div>
          <div className="mt-2">
            <p className="text-white">
              <span className="text-blue-400">@{GrokUser.username}</span> {t.factCheckRequest.replace('{style}', navigator.language.startsWith('ja') ? style.name_ja : style.name_en)}
            </p>
          </div>
          <div className="mt-3 flex space-x-8 text-gray-500">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              <span>0</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span>0</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              <span>0</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
              </svg>
              <span>0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyRequest;
