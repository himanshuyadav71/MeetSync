import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <nav className="flex justify-between items-center p-6 lg:px-12 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          MeetSync
        </div>
        <div className="space-x-4 flex items-center">
          <ThemeToggle />
          <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition">Login</Link>
          <Link to="/signup" className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">Sign Up</Link>
        </div>
      </nav>

      <main className="flex-grow flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 tracking-tight transition-colors duration-200">
          Connect with anyone, <br className="hidden md:block" />
          <span className="text-indigo-600 dark:text-indigo-400">anywhere, anytime.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl transition-colors duration-200">
          Premium real-time video meetings designed for seamlessly connecting teams, clients, and friends. Crystal clear WebRTC video grids up to 6+ participants.
        </p>
        <div className="flex gap-4">
          <Link to="/signup" className="bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-indigo-700 transition shadow-xl shadow-indigo-200">
            Get Started Free
          </Link>
        </div>
        
        {/* Placeholder for Hero Graphic/Animation */}
        <div className="mt-16 relative w-full max-w-4xl opacity-90 animate-fade-in-up">
           <div className="aspect-video bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex items-center justify-center p-4 transition-colors duration-200">
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full h-full p-2">
                   {[
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
                      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80",
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"
                   ].map((src, i) => (
                      <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl relative overflow-hidden group transition-colors duration-200">
                         <img src={src} alt={`Participant ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                         <div className="absolute bottom-3 left-3 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm bg-white/20 border border-white/20">Participant {i+1}</div>
                      </div>
                   ))}
               </div>
           </div>
        </div>
      </main>

      {/* Professional Footer */}
      <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              MeetSync
            </span>
            <span className="text-gray-400 dark:text-gray-500 text-sm">© {new Date().getFullYear()}</span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <span>
              Designed & Developed by <span className="font-semibold text-indigo-600 dark:text-indigo-400">Himanshu Yadav</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
