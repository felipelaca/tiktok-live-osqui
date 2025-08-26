"use client";
import React, { useState } from 'react';
import io from 'socket.io-client';
import RuletaPanel from '@/components/RuletaPanel';

interface Option {
  id: string;
  title: string;
  image: string;
  active: boolean;
}

export default function AdminPanel() {
  const [allOptions, setAllOptions] = useState<Option[]>([]);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editImage, setEditImage] = useState('');
  const [backupStatus, setBackupStatus] = useState<string>('');
  const [autoDisableNotification, setAutoDisableNotification] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const socketRef = React.useRef<any>(null);

  React.useEffect(() => {
    socketRef.current = io();
    socketRef.current.on('connect', () => setIsConnected(true));
    socketRef.current.on('disconnect', () => setIsConnected(false));
    socketRef.current.on('sync', (data: any) => {
      setAllOptions(data.allOptions || []);
      // Detectar si se desactivó una opción automáticamente
      if (data.autoDisabled) {
        setAutoDisableNotification(`🎯 "${data.autoDisabled}" se desactivó automáticamente`);
        setTimeout(() => setAutoDisableNotification(''), 4000);
      }
    });
    socketRef.current.on('backupCreated', (data: any) => {
      if (data.success) {
        setBackupStatus(`✅ Backup creado: ${data.filename}`);
      } else {
        setBackupStatus('❌ Error al crear backup');
      }
      setTimeout(() => setBackupStatus(''), 3000);
    });
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const addOption = () => {
    if (title.trim() && image.trim()) {
      if (socketRef.current) {
        socketRef.current.emit('addOption', { title: title.trim(), image: image.trim() });
      }
      setTitle('');
      setImage('');
    }
  };

  const toggleOption = (id: string, active: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit('toggleOption', { id, active });
    }
  };

  const deleteOption = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta opción?')) {
      if (socketRef.current) {
        socketRef.current.emit('deleteOption', { id });
      }
    }
  };

  const startEdit = (option: Option) => {
    setEditingOption(option);
    setEditTitle(option.title);
    setEditImage(option.image);
  };

  const saveEdit = () => {
    if (editingOption && editTitle.trim() && editImage.trim()) {
      if (socketRef.current) {
        socketRef.current.emit('updateOption', {
          id: editingOption.id,
          title: editTitle.trim(),
          image: editImage.trim()
        });
      }
      setEditingOption(null);
      setEditTitle('');
      setEditImage('');
    }
  };

  const cancelEdit = () => {
    setEditingOption(null);
    setEditTitle('');
    setEditImage('');
  };

  const clearResult = () => {
    if (socketRef.current) {
      socketRef.current.emit('clearResult');
    }
  };

  const createBackup = () => {
    if (socketRef.current) {
      setBackupStatus('Creando backup...');
      socketRef.current.emit('backupData');
    }
  };

  const filteredOptions = allOptions.filter(opt => 
    opt.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = allOptions.filter(opt => opt.active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 lg:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Panel de Administración</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-xs sm:text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              <div className="bg-blue-100 px-2 sm:px-3 py-1 rounded-full">
                <span className="text-blue-800 font-semibold text-xs sm:text-sm">{activeCount} activas</span>
              </div>
              <button
                onClick={createBackup}
                className="bg-orange-500 hover:bg-orange-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                title="Crear backup del historial"
              >
                💾 <span className="hidden sm:inline">Backup</span>
              </button>
            </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  soundEnabled 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
                title={soundEnabled ? 'Desactivar sonidos' : 'Activar sonidos'}
              >
                {soundEnabled ? '🔊' : '🔇'} Sonido
              </button>
            </div>
          </div>
          
          {backupStatus && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-xs sm:text-sm break-words">{backupStatus}</p>
            </div>
          )}
          
          {autoDisableNotification && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-xs sm:text-sm break-words">{autoDisableNotification}</p>
            </div>
          )}

          {/* Agregar nueva opción */}
          <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">Agregar Nueva Opción</h2>
            <div className="flex flex-col gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Título de la opción"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white text-sm sm:text-base"
                onKeyPress={e => e.key === 'Enter' && addOption()}
              />
              <input
                type="text"
                placeholder="URL de la imagen"
                value={image}
                onChange={e => setImage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white text-sm sm:text-base"
                onKeyPress={e => e.key === 'Enter' && addOption()}
              />
              <button 
                onClick={addOption} 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Búsqueda */}
          <div className="mb-4 sm:mb-6">
            <input
              type="text"
              placeholder="Buscar opciones..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white text-sm sm:text-base"
            />
          </div>

          {/* Lista de opciones */}
          <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700">Historial de Opciones</h2>
              <div className="text-xs sm:text-sm text-gray-500 bg-green-100 px-2 sm:px-3 py-1 rounded-full">
                📁 Guardado automáticamente
              </div>
            </div>
            {filteredOptions.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm sm:text-base">No hay opciones disponibles</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-96 overflow-y-auto">
                {filteredOptions.map(option => (
                  <div 
                    key={option.id} 
                    className={`border-2 rounded-lg p-3 sm:p-4 transition-all ${
                      option.active 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 bg-white opacity-60'
                    }`}
                  >
                    {editingOption?.id === option.id ? (
                      // Modo edición
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Título"
                        />
                        <input
                          type="text"
                          value={editImage}
                          onChange={e => setEditImage(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="URL de imagen"
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={saveEdit}
                            className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-xs sm:text-sm hover:bg-green-600 transition-colors"
                          >
                            💾 Guardar
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex-1 bg-gray-500 text-white px-3 py-2 rounded text-xs sm:text-sm hover:bg-gray-600 transition-colors"
                          >
                            ✖️ Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Modo vista
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <label className="flex items-center cursor-pointer flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={option.active}
                              onChange={e => toggleOption(option.id, e.target.checked)}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                            />
                            <span className={`ml-2 font-medium text-sm sm:text-base truncate ${option.active ? 'text-gray-800' : 'text-gray-500'}`}>
                              {option.title}
                            </span>
                          </label>
                        </div>
                        <img 
                          src={option.image} 
                          alt={option.title} 
                          className="w-full h-20 sm:h-24 object-cover rounded-md mb-3"
                          onError={e => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgZmlsbD0iI0Y5RkFGQiIgc3Ryb2tlPSIjRDFENUQ5IiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiIGZpbGw9IiNEMUQ1RDkiLz4KPHBhdGggZD0iTTIxIDEybC0zLTMtNS41IDUuNS0zLTMtNC41IDQuNSIgc3Ryb2tlPSIjRDFENUQ5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
                          }}
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => startEdit(option)}
                            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-xs sm:text-sm hover:bg-blue-600 transition-colors"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => deleteOption(option.id)}
                            className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-xs sm:text-sm hover:bg-red-600 transition-colors"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ruleta */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">Ruleta en Vivo</h2>
            <button
              onClick={clearResult}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              🔄 Preparar Nueva Ruleta
            </button>
          </div>
          <div className="overflow-hidden">
            <RuletaPanel showButton={true} soundEnabled={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
