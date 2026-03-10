import { useState, useEffect, useRef, useCallback } from 'react';
import { socket } from '../services/socket';

export const useWebRTC = (roomId, userId, username) => {
  const [peers, setPeers] = useState([]); // [{peerId, username, stream, isMuted, isCameraOff}]
  const [localStream, setLocalStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  
  const peerConnections = useRef({}); // map socketId -> RTCPeerConnection
  const localStreamRef = useRef(null);

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ],
  };

  useEffect(() => {
    if (!roomId || !userId) return;

    // Connect socket
    socket.connect();
    
    // Setup local media
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        localStreamRef.current = stream;

        // Join Room
        socket.emit('join-room', roomId, userId, username);
      } catch (err) {
        console.error("Error accessing media devices.", err);
        alert("Please allow camera and mic permissions to join the meeting.");
      }
    };

    initMedia();

    // Socket Event: User joined
    socket.on('user-connected', async (newUserId, newUsername, newSocketId) => {
        // Create an offer for the new user
        const pc = createPeerConnection(newSocketId, newUsername);
        peerConnections.current[newSocketId] = pc;
        
        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            
            socket.emit('offer', {
                target: newSocketId,
                caller: socket.id,
                sdp: pc.localDescription,
                username: username
            });
        } catch (e) {
            console.error("Error creating offer", e);
        }
    });

    // Socket Event: Received Offer
    socket.on('offer', async (payload) => {
        const pc = createPeerConnection(payload.caller, payload.username);
        peerConnections.current[payload.caller] = pc;
        
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            
            socket.emit('answer', {
                target: payload.caller,
                caller: socket.id,
                sdp: pc.localDescription
            });
        } catch (e) {
           console.error("Error handling offer", e);
        }
    });

    // Socket Event: Received Answer
    socket.on('answer', async (payload) => {
        const pc = peerConnections.current[payload.caller];
        if (pc) {
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            } catch (e) {
                console.error("Error handling answer", e);
            }
        }
    });

    // Socket Event: Received ICE Candidate
    socket.on('ice-candidate', async (payload) => {
        const pc = peerConnections.current[payload.caller];
        if (pc) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            } catch (e) {
                console.error("Error adding ice candidate", e);
            }
        }
    });

    // Socket Event: User Disconnected
    socket.on('user-disconnected', (disconnectedUserId, disconnectedSocketId) => {
        if (peerConnections.current[disconnectedSocketId]) {
            peerConnections.current[disconnectedSocketId].close();
            delete peerConnections.current[disconnectedSocketId];
        }
        setPeers(prev => prev.filter(p => p.peerId !== disconnectedSocketId));
    });

    // Chat Events
    socket.on('chat-message', (message) => {
        setChatMessages(prev => [...prev, message]);
    });

    socket.on('muted-by-host', () => {
        toggleAudio(true);
    });

    socket.on('removed-by-host', () => {
        leaveMeeting();
    });

    return () => {
        socket.disconnect();
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        Object.values(peerConnections.current).forEach(pc => pc.close());
    };
  }, [roomId, userId, username]);

  const createPeerConnection = (partnerSocketId, partnerUsername) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      // Add local tracks to PC
      if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
              pc.addTrack(track, localStreamRef.current);
          });
      }

      // Handle receiving tracks
      pc.ontrack = (event) => {
          setPeers(prev => {
              const existingPeer = prev.find(p => p.peerId === partnerSocketId);
              if (existingPeer) return prev; // Avoid duplicate streams if multiple tracks fire
              
              return [...prev, {
                  peerId: partnerSocketId,
                  username: partnerUsername,
                  stream: event.streams[0]
              }];
          });
      };

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
          if (event.candidate) {
              socket.emit('ice-candidate', {
                  target: partnerSocketId,
                  caller: socket.id,
                  candidate: event.candidate
              });
          }
      };

      return pc;
  };

  const toggleAudio = (forceMute = false) => {
      if (localStreamRef.current) {
          const audioTracks = localStreamRef.current.getAudioTracks();
          if (audioTracks.length > 0) {
              const shouldMute = forceMute || !isAudioMuted;
              audioTracks[0].enabled = !shouldMute;
              setIsAudioMuted(shouldMute);
          }
      }
  };

  const toggleVideo = () => {
      if (localStreamRef.current) {
          const videoTracks = localStreamRef.current.getVideoTracks();
          if (videoTracks.length > 0) {
              const shouldMute = !isVideoMuted;
              videoTracks[0].enabled = !shouldMute;
              setIsVideoMuted(shouldMute);
          }
      }
  };

  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const stopScreenShare = async () => {
    if (!isScreenSharing) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const newVideoTrack = stream.getVideoTracks()[0];

      if (localStreamRef.current) {
        const currentVideoTrack = localStreamRef.current.getVideoTracks()[0];
        if (currentVideoTrack) {
          localStreamRef.current.removeTrack(currentVideoTrack);
          currentVideoTrack.stop();
        }

        newVideoTrack.enabled = !isVideoMuted;
        localStreamRef.current.addTrack(newVideoTrack);
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));

        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(newVideoTrack);
          }
        });
      }
      setIsScreenSharing(false);
    } catch (err) {
      console.error("Failed to recover camera", err);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = stream.getVideoTracks()[0];

        screenTrack.onended = () => {
          stopScreenShare();
        };

        if (localStreamRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          if (videoTrack) {
            localStreamRef.current.removeTrack(videoTrack);
            videoTrack.stop();
          }
          localStreamRef.current.addTrack(screenTrack);
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));

          Object.values(peerConnections.current).forEach(pc => {
            const sender = pc.getSenders().find(s => s.track.kind === 'video');
            if (sender) {
              sender.replaceTrack(screenTrack);
            }
          });
        }
        setIsScreenSharing(true);
      } catch (err) {
        console.error("Screen share failed", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const sendChatMessage = (text) => {
      socket.emit('chat-message', { text, timestamp: new Date().toISOString() });
  };

  const leaveMeeting = () => {
      socket.disconnect();
      if (localStreamRef.current) {
         localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      window.location.href = '/dashboard';
  };

  return {
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
      leaveMeeting,
      socketId: socket.id
  };
};
