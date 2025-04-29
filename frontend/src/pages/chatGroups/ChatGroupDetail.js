import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchChatGroupById, sendMessage, clearCurrentGroup } from '../../redux/slices/chatGroupSlice';
import { formatDate } from '../../utils/helpers';

function ChatGroupDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentGroup, isLoading, error } = useSelector((state) => state.chatGroups);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    dispatch(fetchChatGroupById(id));

    return () => {
      dispatch(clearCurrentGroup());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentGroup]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    dispatch(sendMessage({ groupId: id, content: newMessage, type: 'TEXT' }));
    setNewMessage('');
  };

  if (isLoading || !currentGroup) {
    return <p>Loading chat group...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-4">{currentGroup.name}</h1>
      <div className="flex-1 overflow-y-auto border rounded p-4 bg-white">
        {currentGroup.messages.length === 0 && <p>No messages yet.</p>}
        {currentGroup.messages.map((msg) => (
          <div key={msg.id} className="mb-3">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{msg.sender?.name || 'Unknown'}</span>
              <span className="text-xs text-gray-500">{formatDate(msg.createdAt, { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="ml-2">{msg.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex space-x-2">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatGroupDetail;
