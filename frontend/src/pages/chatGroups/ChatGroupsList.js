import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChatGroups } from '../../redux/slices/chatGroupSlice';
import { Link } from 'react-router-dom';

function ChatGroupsList() {
  const dispatch = useDispatch();
  const { groups, isLoading, error } = useSelector((state) => state.chatGroups);

  useEffect(() => {
    dispatch(fetchChatGroups());
  }, [dispatch]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Chat Groups</h1>
      {isLoading && <p>Loading chat groups...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-2">
        {groups.map((group) => (
          <li key={group.id} className="p-4 bg-white rounded shadow hover:bg-gray-50">
            <Link to={`/chat-groups/${group.id}`} className="text-lg font-semibold text-primary-600">
              {group.name}
            </Link>
            <p className="text-sm text-gray-500">{group.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatGroupsList;
