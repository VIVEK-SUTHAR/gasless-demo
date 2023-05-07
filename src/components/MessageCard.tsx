import React from "react";

type MessageCardProps = {
  from: string;
  message: string;
};

const MessageCard: React.FC<MessageCardProps> = ({ from, message }) => {
  return (
    <article className="block p-6 w-2/6 my-2  bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
      {from}
      <p className="font-normal text-lg  text-gray-700 dark:text-gray-400">
        {message}
      </p>
    </article>
  );
};
export default MessageCard;
