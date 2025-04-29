import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Transition } from '@headlessui/react';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { removeNotification } from '../../redux/slices/notificationSlice';

const icons = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  info: InformationCircleIcon,
};

const colors = {
  success: 'text-green-400',
  error: 'text-red-400',
  info: 'text-blue-400',
};

const backgrounds = {
  success: 'bg-green-50',
  error: 'bg-red-50',
  info: 'bg-blue-50',
};

function NotificationContainer() {
  const notifications = useSelector((state) => state.notifications.items);
  const dispatch = useDispatch();

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {notifications.map((notification) => {
          const Icon = icons[notification.type];

          return (
            <Transition
              key={notification.id}
              show={true}
              enter="transform ease-out duration-300 transition"
              enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
              enterTo="translate-y-0 opacity-100 sm:translate-x-0"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div
                className={`max-w-sm w-full ${backgrounds[notification.type]} shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`}
              >
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Icon
                        className={`h-6 w-6 ${colors[notification.type]}`}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {notification.message}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                      <button
                        className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => {
                          dispatch(removeNotification(notification.id));
                        }}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          );
        })}
      </div>
    </div>
  );
}

export default NotificationContainer;
