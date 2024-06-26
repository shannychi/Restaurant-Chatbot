import chatbot from "../assets/chatbot.jpg";
import { useState, useEffect } from "react";
import io from 'socket.io-client';

const socket = io('https://restaurant-chatbot-bwzj.onrender.com');

const ChatMessage = () => {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);

    useEffect(() => {
        socket.on('message', (msg) => {
            setChat((prevChat) => [...prevChat, { user: 'bot', message: msg }]);
        });

        return () => {
            socket.off('message');
        };
    }, []);

    const sendMessage = (message) => {
        if (message.trim()) {
            setChat((prevChat) => [...prevChat, { user: 'user', message }]);
            socket.emit('message', message);
        }
    };

    const handleButtonClick = (message) => {
        sendMessage(message);
    };

    const renderMessage = (msg) => {
        const formattedMessage = msg.replace(/\n/g, '<br>');
        return { __html: formattedMessage };
    };
    return (

           <div className="flex flex-col overflow-y-auto h-screen  justify-center items-center">
            
            <div className="flex-grow overflow-y-auto  h-screen  max-w-sm m-5 w-full bg-white shadow-2xl ">
    
                <div className="flex flex-col m-4 gap-4 py-4">
                {chat.map((chat, index) => (
                    <div key={index} className={`flex ${chat.user === 'bot' ? 'justify-start' : 'justify-end'} mb-4`}>
                         <div className={`rounded-lg px-4 py-2 max-w-[80%]  ${chat.user === 'bot' ? 'bg-gray-100 text-gray-900' : 'bg-blue-500 text-white'}`}>
                         <p className="text-sm" dangerouslySetInnerHTML={renderMessage(chat.message)}></p>
                   </div>
                    </div>
                ))}
                </div>
              

                </div>
            
           <div className="flex shadow-2xl  justify-center items-center bottom-0 h-16">
           <form
                onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage(message);
                    setMessage('');
                }}
                 className="flex w-full px-4"
            >
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="type here"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full mr-4"
                />
                <button type="submit"  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Send</button>
            </form>
           </div>
           </div>
        
    );
};

export default ChatMessage;
