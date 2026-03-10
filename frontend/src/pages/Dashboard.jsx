import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Video, Plus, LogOut } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [joinRoomId, setJoinRoomId] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleCreateMeeting = async () => {
    try {
      const res = await api.post('/meetings');
      navigate(`/meeting/${res.data.roomId}`);
    } catch (err) {
      alert('Failed to create meeting');
    }
  };

  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    if (!joinRoomId.trim()) return;
    
    // Extract room ID if user pasted a full URL
    let parsedRoomId = joinRoomId.trim();
    if (parsedRoomId.includes('/meeting/')) {
        const parts = parsedRoomId.split('/meeting/');
        if (parts.length > 1) {
            parsedRoomId = parts[1].split('/')[0].split('?')[0];
        }
    }
    
    try {
      await api.get(`/meetings/${parsedRoomId}`);
      navigate(`/meeting/${parsedRoomId}`);
    } catch (err) {
      if (err.response) {
          if (err.response.status === 404) {
              alert('Meeting not found. Please check the ID or link.');
          } else if (err.response.status === 401) {
              alert('Authentication failed. Please log in again.');
              logout();
              navigate('/login');
          } else {
              alert(`Server error (${err.response.status}). Keep trying.`);
          }
      } else {
          alert('Network error. Unable to connect to server.');
      }
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex justify-between items-center transition-colors duration-200">
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">MeetSync</h1>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <span className="text-gray-600 dark:text-gray-300 font-medium">Hello, {user.username}</span>
          <button onClick={() => { logout(); navigate('/'); }} className="text-gray-500 dark:text-gray-400 hover:text-red-500 flex items-center transition">
            <LogOut size={18} className="mr-1"/> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto mt-12 p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Meeting */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center hover:shadow-lg transition">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-full mb-4 text-indigo-600 dark:text-indigo-400">
               <Video size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">New Meeting</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Start an instant meeting and invite others to join.</p>
            <button 
              onClick={handleCreateMeeting}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center shadow-md shadow-indigo-500/30"
            >
              <Plus size={20} className="mr-2"/> Create Meeting
            </button>
          </div>

          {/* Join Meeting */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center hover:shadow-lg transition">
             <form onSubmit={handleJoinMeeting} className="w-full">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Join Meeting</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Enter the meeting ID or link to join an existing room.</p>
              <div className="flex flex-col space-y-4">
                <input 
                  type="text" 
                  placeholder="Enter Room ID" 
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-full"
                  required
                />
                <button 
                  type="submit"
                  className="w-full bg-gray-800 dark:bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 dark:hover:bg-gray-600 transition shadow-md"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
