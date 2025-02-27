import React, { useState, useRef } from 'react';
import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';

import RenameButton from './RenameButton';
import DeleteButton from './DeleteButton';
import ConvoIcon from '../svg/ConvoIcon';
import manualSWR from '~/utils/fetchers';

import store from '~/store';

export default function Conversation({ conversation, retainView }) {
  const [currentConversation, setCurrentConversation] = useRecoilState(store.conversation);
  const setMessages = useSetRecoilState(store.messages);
  const setSubmission = useSetRecoilState(store.submission);
  const resetLatestMessage = useResetRecoilState(store.latestMessage);

  const { refreshConversations } = store.useConversations();
  const { switchToConversation } = store.useConversation();

  const [renaming, setRenaming] = useState(false);
  const inputRef = useRef(null);

  const {
    model,
    parentMessageId,
    conversationId,
    title,
    chatGptLabel = null,
    promptPrefix = null,
    jailbreakConversationId,
    conversationSignature,
    clientId,
    invocationId,
    toneStyle
  } = conversation;

  const [titleInput, setTitleInput] = useState(title);

  const rename = manualSWR(`/api/convos/update`, 'post');

  const bingData = conversationSignature
    ? {
        jailbreakConversationId: jailbreakConversationId,
        conversationSignature: conversationSignature,
        parentMessageId: parentMessageId || null,
        clientId: clientId,
        invocationId: invocationId,
        toneStyle: toneStyle
      }
    : null;

  const clickHandler = async () => {
    if (currentConversation?.conversationId === conversationId) {
      return;
    }

    // stop existing submission
    setSubmission(null);

    // set conversation to the new conversation
    switchToConversation(conversation);

    // if (!stopStream) {
    //   dispatch(setStopStream(true));
    //   dispatch(setSubmission({}));
    // }
    // dispatch(setEmptyMessage());

    // const convo = { title, error: false, conversationId: id, chatGptLabel, promptPrefix };

    // if (bingData) {
    //   const {
    //     parentMessageId,
    //     conversationSignature,
    //     jailbreakConversationId,
    //     clientId,
    //     invocationId,
    //     toneStyle
    //   } = bingData;
    //   dispatch(
    //     setConversation({
    //       ...convo,
    //       parentMessageId,
    //       jailbreakConversationId,
    //       conversationSignature,
    //       clientId,
    //       invocationId,
    //       toneStyle,
    //       latestMessage: null
    //     })
    //   );
    // } else {
    //   dispatch(
    //     setConversation({
    //       ...convo,
    //       parentMessageId,
    //       jailbreakConversationId: null,
    //       conversationSignature: null,
    //       clientId: null,
    //       invocationId: null,
    //       toneStyle: null,
    //       latestMessage: null
    //     })
    //   );
    // }
    // const data = await trigger();

    // if (chatGptLabel) {
    //   dispatch(setModel('chatgptCustom'));
    //   dispatch(setCustomModel(chatGptLabel.toLowerCase()));
    // } else {
    //   dispatch(setModel(model));
    //   dispatch(setCustomModel(null));
    // }

    // dispatch(setMessages(data));
    // dispatch(setCustomGpt(convo));
    // dispatch(setText(''));
    // dispatch(setStopStream(false));
  };

  const renameHandler = e => {
    e.preventDefault();
    setTitleInput(title);
    setRenaming(true);
    setTimeout(() => {
      inputRef.current.focus();
    }, 25);
  };

  const cancelHandler = e => {
    e.preventDefault();
    setRenaming(false);
  };

  const onRename = e => {
    e.preventDefault();
    setRenaming(false);
    if (titleInput === title) {
      return;
    }
    rename.trigger({ conversationId, title: titleInput }).then(() => {
      refreshConversations();
      if (conversationId == currentConversation?.conversationId)
        setCurrentConversation(prevState => ({
          ...prevState,
          title: titleInput
        }));
    });
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      onRename(e);
    }
  };

  const aProps = {
    className:
      'animate-flash group relative flex cursor-pointer items-center gap-3 break-all rounded-md bg-gray-800 py-3 px-3 pr-14 hover:bg-gray-800'
  };

  if (currentConversation?.conversationId !== conversationId) {
    aProps.className =
      'group relative flex cursor-pointer items-center gap-3 break-all rounded-md py-3 px-3 hover:bg-[#2A2B32] hover:pr-4';
  }

  return (
    <a
      onClick={() => clickHandler()}
      {...aProps}
    >
      <ConvoIcon />
      <div className="relative max-h-5 flex-1 overflow-hidden text-ellipsis break-all">
        {renaming === true ? (
          <input
            ref={inputRef}
            type="text"
            className="m-0 mr-0 w-full border border-blue-500 bg-transparent p-0 text-sm leading-tight outline-none"
            value={titleInput}
            onChange={e => setTitleInput(e.target.value)}
            onBlur={onRename}
            onKeyDown={handleKeyDown}
          />
        ) : (
          title
        )}
      </div>
      {currentConversation?.conversationId === conversationId ? (
        <div className="visible absolute right-1 z-10 flex text-gray-300">
          <RenameButton
            conversationId={conversationId}
            renaming={renaming}
            renameHandler={renameHandler}
            onRename={onRename}
          />
          <DeleteButton
            conversationId={conversationId}
            renaming={renaming}
            cancelHandler={cancelHandler}
            retainView={retainView}
          />
        </div>
      ) : (
        <div className="absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-gray-900 group-hover:from-[#2A2B32]" />
      )}
    </a>
  );
}
