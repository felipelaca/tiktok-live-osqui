"use client";
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

function ResultModal(props: { selected: any, onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(props.onClose, 5000);
    return () => clearTimeout(timer);
  }, [props.onClose]);
  
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-4 shadow-2xl transform scale-105 animate-bounce-once">
        <img 
          src={props.selected.image} 
          alt={props.selected.title} 
          className="mx-auto w-40 h-40 object-cover rounded-2xl shadow-lg mb-6 animate-pulse-once" 
        />
        <p className="text-4xl text-gray-800 font-bold animate-slide-up">{props.selected.title}</p>
      </div>
    </div>
  );
}

export default function RuletaPanel({ showButton = false, soundEnabled = true }: { showButton?: boolean, soundEnabled?: boolean }) {
  const [options, setOptions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const socketRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);

  // Función para reproducir sonidos
  const playSound = (type: 'spin' | 'winner') => {
    if (!soundEnabled) return; // No reproducir si está desactivado
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (type === 'spin') {
        // Sonido de giro - tono ascendente rápido
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.type = 'sine';
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
      } else if (type === 'winner') {
        // Sonido de victoria - acordes alegres
        const playNote = (frequency: number, startTime: number, duration: number) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
          oscillator.type = 'triangle';
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);
          
          oscillator.start(audioContext.currentTime + startTime);
          oscillator.stop(audioContext.currentTime + startTime + duration);
        };
        
        // Secuencia de notas alegres (Do-Mi-Sol-Do)
        playNote(523.25, 0, 0.3);    // Do
        playNote(659.25, 0.15, 0.3); // Mi
        playNote(783.99, 0.3, 0.3);  // Sol
        playNote(1046.50, 0.45, 0.5); // Do (octava alta)
      }
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  useEffect(() => {
    socketRef.current = io();
    socketRef.current.on('sync', (data: any) => {
      // Filtrar solo las opciones activas
      const activeOptions = data.allOptions ? data.allOptions.filter((opt: any) => opt.active) : data.options || [];
      setOptions(activeOptions);
      if (data.spinning && !spinning) {
        animateSpin(activeOptions);
      }
      if (!data.spinning) {
        setSpinning(false);
        setSelected(data.selected);
        setShowResult(data.showResult);
      }
    });
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  const animateSpin = (opts: any[]) => {
    setSpinning(true);
    setShowResult(false);
    setSelected(null);
    
    // Reproducir sonido de giro
    playSound('spin');
    
    const duration = Math.random() * 9 + 8;
    const endTime = Date.now() + duration * 1000;
    let angle = 0;
    const spin = () => {
      if (Date.now() < endTime) {
        angle += 0.2 + Math.random() * 0.05;
        drawWheel(angle, opts);
        requestAnimationFrame(spin);
      } else {
        const winnerIdx = Math.floor(Math.random() * opts.length);
        const winner = opts[winnerIdx];
        drawWheel(angle, opts, winnerIdx);
        setSpinning(false);
        
        // Reproducir sonido de ganador después de un pequeño delay
        setTimeout(() => {
          playSound('winner');
        }, 800);
        
        // Solo emitir el resultado al backend, no mostrar localmente
        if (socketRef.current) {
          socketRef.current.emit('result', { selected: winner });
        }
      }
    };
    spin();
  };

  const spinWheel = () => {
    if (options.length === 0 || spinning) return;
    
    // Sonido de click al presionar el botón
    if (soundEnabled) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (error) {
        console.log('Button click audio not supported:', error);
      }
    }
    
    if (socketRef.current) socketRef.current.emit('spin');
  };

  const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
    '#00D2D3', '#FF9F43', '#EE5A24', '#00D2D3', '#2E86DE', '#A55EEA', '#26DE81', '#FED330',
    '#FC5C65', '#FD79A8', '#FDCB6E', '#6C5CE7', '#74B9FF', '#00B894', '#E17055', '#00CEC9'
  ];
  const drawWheel = (angle: any, opts: any[], winnerIdx?: any) => {
    const canvas = canvasRef.current;
    if (!canvas || !opts || opts.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    
    // Dibujar sombra exterior
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
    
    const arc = (2 * Math.PI) / opts.length;
    
    opts.forEach((opt: any, i: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(size / 2, size / 2);
      ctx.arc(
        size / 2,
        size / 2,
        size / 2 - 15,
        angle + i * arc,
        angle + (i + 1) * arc
      );
      ctx.closePath();
      
      // Gradiente para cada sector
      const gradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2 - 15
      );
      gradient.addColorStop(0, COLORS[i % COLORS.length]);
      gradient.addColorStop(1, COLORS[i % COLORS.length] + '99');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Borde del sector
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      
      // Texto
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate(angle + (i + 0.5) * arc);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Segoe UI", system-ui, sans-serif';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 3;
      
      const maxWidth = size / 2 - 50;
      let text = opt.title;
      if (ctx.measureText(text).width > maxWidth) {
        while (ctx.measureText(text + '...').width > maxWidth && text.length > 0) {
          text = text.slice(0, -1);
        }
        text += '...';
      }
      
      const textX = size / 2 - 80;
      ctx.strokeText(text, textX, 5, maxWidth);
      ctx.fillText(text, textX, 5, maxWidth);
      ctx.restore();
    });
    
    // Centro decorativo
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#2c3e50';
    ctx.fill();
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
    
    // Flecha indicadora mejorada
    ctx.save();
    ctx.translate(size / 2, 15);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-15, 30);
    ctx.lineTo(15, 30);
    ctx.closePath();
    
    // Gradiente para la flecha
    const arrowGradient = ctx.createLinearGradient(0, 0, 0, 30);
    arrowGradient.addColorStop(0, '#e74c3c');
    arrowGradient.addColorStop(1, '#c0392b');
    ctx.fillStyle = arrowGradient;
    ctx.fill();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    
    // Resaltar ganador
    if (winnerIdx !== undefined) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 15, angle + winnerIdx * arc, angle + (winnerIdx + 1) * arc);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#f39c12';
      ctx.shadowColor = '#f39c12';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();
    }
  };

  useEffect(() => {
    drawWheel(0, options);
  }, [options]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent relative">
      <div className="relative">
        {!showResult && (
          <canvas 
            ref={canvasRef} 
            style={{ 
              background: 'transparent', 
              transition: 'all 0.3s ease',
              opacity: spinning ? 0.8 : 1,
              filter: spinning ? 'blur(1px)' : 'none'
            }} 
          />
        )}
        
        {spinning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white bg-opacity-90 rounded-full p-4 shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        )}
      </div>
      
      {showButton && (
        <button
          onClick={spinWheel}
          disabled={spinning || options.length === 0}
          className={`mt-6 px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all duration-200 ${
            spinning || options.length === 0
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform hover:scale-105 active:scale-95'
          }`}
        >
          {spinning ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Girando...
            </span>
          ) : (
            '🎯 Lanzar Ruleta'
          )}
        </button>
      )}
      
      {options.length === 0 && !spinning && (
        <div className="mt-6 text-center text-gray-500 bg-yellow-50 p-4 rounded-lg border-2 border-dashed border-yellow-200">
          <p className="text-lg font-semibold">No hay opciones activas</p>
          <p className="text-sm">Agrega algunas opciones en el panel de administración</p>
        </div>
      )}
      
      {selected && showResult && (
        <ResultModal selected={selected} onClose={() => setShowResult(false)} />
      )}
      
      <style>{`
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: scale(0.8);
          }
          to { 
            opacity: 1; 
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        @keyframes bounce-once {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-15px,0);
          }
          70% {
            transform: translate3d(0,-7px,0);
          }
          90% {
            transform: translate3d(0,-2px,0);
          }
        }
        .animate-bounce-once {
          animation: bounce-once 0.8s ease-out;
        }
        
        @keyframes pulse-once {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-pulse-once {
          animation: pulse-once 0.6s ease-in-out;
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.3s both;
        }
      `}</style>
    </div>
  );
}
