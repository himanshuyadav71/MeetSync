import React, { useContext, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useWebRTC } from '../hooks/useWebRTC';
import VideoPlayer from '../components/VideoPlayer';
import { Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff, Users, Send, MonitorUp } from 'lucide-react';
import api from '../services/api';

const MeetingRoom = () => {
    const { roomId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        if (!user) {
            navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
            return;
        }
        
        // Validate room exists on direct entry
        const validateRoom = async () => {
            try {
                await api.get(`/meetings/${roomId}`);
            } catch (err) {
                if (err.response) {
                    if (err.response.status === 404) {
                        alert("Meeting not found. The room ID might be incorrect.");
                    } else if (err.response.status === 401) {
                        alert("Authentication required. Please log in again.");
                    } else {
                        alert(`Server Error: ${err.response.status}. Please try again later.`);
                    }
                } else {
                    alert("Network error. Please check your connection.");
                }
                navigate('/dashboard');
            }
        };
        validateRoom();
        
    }, [user, navigate, location.pathname, roomId]);

    if (!user) return null;

    const {
        localStream,
        peers,
        isAudioMuted,
        isVideoMuted,
        isScreenSharing,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
        chatMessages,
        sendChatMessage,
        leaveMeeting
    } = useWebRTC(roomId, user.id, user.username);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatText, setChatText] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        // Auto-scroll chat
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, isChatOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (chatText.trim()) {
            sendChatMessage(chatText);
            setChatText('');
        }
    };

    // Calculate grid layout based on number of participants (1 local + N peers)
    const totalParticipants = peers.length + 1;
    let gridColsClass = "grid-cols-1 md:grid-cols-2";
    if (totalParticipants > 2 && totalParticipants <= 4) gridColsClass = "grid-cols-2";
    if (totalParticipants > 4) gridColsClass = "grid-cols-2 md:grid-cols-3";

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-900 fixed inset-0">
            {/* Main Video Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 w-full ${isChatOpen ? 'lg:pr-[320px]' : ''}`}>
                {/* Header (Optional) */}
                <div className="absolute top-0 left-0 right-0 p-4 z-10 pointer-events-none flex justify-between items-start">
                    <div className="bg-black/40 backdrop-blur-md px-3 md:px-4 py-2 md:py-3 rounded-lg text-white font-medium text-xs md:text-sm pointer-events-auto flex items-center space-x-2 md:space-x-4 shadow border border-white/10 max-w-full overflow-hidden">
                        <span className="truncate">ID: {roomId}</span>
                        <div className="w-[1px] h-4 bg-white/20 shrink-0"></div>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/meeting/${roomId}`);
                                alert('Meeting Link Copied!');
                            }} 
                            className="text-indigo-300 hover:text-indigo-200 flex items-center transition bg-white/10 px-2 py-1 rounded whitespace-nowrap shrink-0"
                        >
                            Copy Link
                        </button>
                    </div>
                </div>

                {/* Video Grid */}
                <div className="flex-1 p-2 md:p-4 flex items-center justify-center pt-16 md:pt-20 overflow-hidden">
                    <div className={`w-full max-w-7xl grid gap-2 md:gap-4 ${gridColsClass} h-full content-center`}>
                        <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 bg-gray-800 flex h-full min-h-[150px] relative">
                            <VideoPlayer stream={localStream} isLocal={true} username={user.username} />
                        </div>
                        {peers.map(peer => (
                           <div key={peer.peerId} className="rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 bg-gray-800 flex h-full min-h-[150px] relative">
                               <VideoPlayer stream={peer.stream} isLocal={false} username={peer.username} />
                           </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Controls Bar */}
                <div className="min-h-[5rem] py-3 bg-gray-800/90 backdrop-blur-lg border-t border-gray-700 flex flex-wrap items-center justify-center px-4 gap-3 md:gap-4 z-20">
                    <button 
                        onClick={() => toggleAudio()} 
                        className={`p-4 rounded-full transition ${isAudioMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                    >
                        {isAudioMuted ? <MicOff size={22}/> : <Mic size={22}/>}
                    </button>
                    
                    <button 
                        onClick={toggleVideo} 
                        className={`p-4 rounded-full transition ${isVideoMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                    >
                        {isVideoMuted ? <VideoOff size={22}/> : <Video size={22}/>}
                    </button>

                    <button 
                        onClick={toggleScreenShare} 
                        className={`p-4 rounded-full transition ${isScreenSharing ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'} ml-4`}
                        title="Share Screen"
                    >
                        <MonitorUp size={22}/>
                    </button>

                    <button 
                         onClick={() => setIsChatOpen(!isChatOpen)}
                         className={`p-4 rounded-full transition ${isChatOpen ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'} ml-4 relative`}
                    >
                         <MessageSquare size={22}/>
                         {/* Optional: Unread indicator */}
                    </button>

                     <button 
                        onClick={leaveMeeting} 
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white ml-2 md:ml-8 transition shadow-lg shadow-red-900/50"
                    >
                        <PhoneOff size={22}/>
                    </button>
                </div>
            </div>

            {/* Sidebar Chat */}
            <div className={`fixed top-0 right-0 bottom-0 w-full md:w-[320px] bg-white transform transition-transform duration-300 ${isChatOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'} flex flex-col z-30`}>
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <h3 className="font-semibold text-gray-800">In-call Messages</h3>
                    <button onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-gray-800">×</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {chatMessages.map((msg, idx) => {
                        const isMe = msg.senderId === user.id;
                        return (
                            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && <span className="text-xs text-gray-500 mb-1 ml-1">{msg.senderName}</span>}
                                <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-gray-200 text-gray-800 rounded-tl-sm'}`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 mx-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t bg-white">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-full px-4 py-2 text-sm"
                            placeholder="Send a message..."
                            value={chatText}
                            onChange={(e) => setChatText(e.target.value)}
                        />
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition" disabled={!chatText.trim()}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MeetingRoom;
