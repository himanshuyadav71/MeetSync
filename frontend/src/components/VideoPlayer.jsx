import React, { useRef, useEffect } from 'react';

const VideoPlayer = ({ stream, isLocal, username }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="absolute inset-0 bg-gray-800 rounded-xl overflow-hidden shadow-lg group">
            {stream ? (
               <video 
                   ref={videoRef}
                   autoPlay
                   playsInline
                   muted={isLocal} // Always mute local video to prevent echo
                   className="w-full h-full object-cover"
               />
            ) : (
               <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400">
                   <div className="animate-pulse flex space-x-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                   </div>
               </div>
            )}
            
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded truncate max-w-[80%]">
                {username} {isLocal && "(You)"}
            </div>
            
            {/* Overlay if video is muted (could detect video tracks status here if preferred) */}
        </div>
    );
};

export default VideoPlayer;
