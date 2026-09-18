import React, { useState } from 'react';
import { AppInfo, LauncherTheme, getAppDisplayName } from '../../types';
import { ArrowLeft, Home, Phone, Send, Plus, Search, Check, Sparkles } from 'lucide-react';

interface SimulatedAppViewProps {
  app: AppInfo;
  theme: LauncherTheme;
  showPackageNames?: boolean;
  onClose: () => void;
}

export const SimulatedAppView: React.FC<SimulatedAppViewProps> = ({ app, theme, showPackageNames = false, onClose }) => {
  const isLight = theme === 'light';
  const bgColor = isLight ? 'bg-white' : 'bg-black';
  const textColor = isLight ? 'text-neutral-900' : 'text-neutral-100';
  const subTextColor = isLight ? 'text-neutral-500' : 'text-neutral-400';
  const borderColor = isLight ? 'border-neutral-200' : 'border-neutral-800';

  // State for interactive mini-apps
  const [phoneInput, setPhoneInput] = useState('');
  const [notes, setNotes] = useState<string[]>([
    'Minimalism is not a lack of something. It is simply the perfect amount of everything.',
    'Focus on essential daily tasks',
    'Walk 30 mins in morning sunlight',
  ]);
  const [newNote, setNewNote] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messagesList, setMessagesList] = useState([
    { sender: 'Mom', text: 'Have a great quiet day! 🌿' },
    { sender: 'You', text: 'Thanks Mom, focusing on reading today.' },
  ]);

  const appKey = app.label.toLowerCase();

  return (
    <div className={`absolute inset-0 z-40 ${bgColor} ${textColor} flex flex-col transition-all duration-200 select-none overflow-hidden`}>
      {/* App Header Bar */}
      <div className={`px-4 pt-10 pb-3 flex items-center justify-between border-b ${borderColor}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full ${isLight ? 'hover:bg-neutral-100' : 'hover:bg-neutral-900'} transition-colors`}
            title="Back to Launcher"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="font-mono text-sm tracking-wide font-medium lowercase">
              {getAppDisplayName(app)}
            </span>
            {showPackageNames && (
              <div className={`text-[10px] ${subTextColor} font-mono truncate max-w-[180px]`}>
                {app.packageName}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border ${borderColor} ${isLight ? 'hover:bg-neutral-100' : 'hover:bg-neutral-900'} transition-colors`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
      </div>

      {/* App Body Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Phone / Dialer App */}
        {appKey.includes('phone') || appKey.includes('dial') ? (
          <div className="flex flex-col h-full max-w-xs mx-auto justify-between py-4">
            <div className="text-center my-4">
              <div className="h-10 text-2xl font-mono tracking-widest flex items-center justify-center">
                {phoneInput || <span className={subTextColor}>Enter digits</span>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 my-2 text-center font-mono">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((d) => (
                <button
                  key={d}
                  onClick={() => setPhoneInput((prev) => (prev.length < 15 ? prev + d : prev))}
                  className={`h-12 rounded-full border ${borderColor} flex items-center justify-center text-lg active:scale-95 transition-all ${isLight ? 'hover:bg-neutral-100' : 'hover:bg-neutral-900'}`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4">
              {phoneInput && (
                <button
                  onClick={() => setPhoneInput((prev) => prev.slice(0, -1))}
                  className={`text-xs ${subTextColor} hover:underline`}
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => alert(`Simulated dialing: ${phoneInput || 'Emergency'}`)}
                className={`w-14 h-14 rounded-full flex items-center justify-center ${isLight ? 'bg-black text-white' : 'bg-white text-black'} shadow-sm active:scale-95 transition-transform`}
              >
                <Phone className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : appKey.includes('note') || appKey.includes('keep') ? (
          /* Notes App */
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newNote.trim()) {
                    setNotes([newNote.trim(), ...notes]);
                    setNewNote('');
                  }
                }}
                placeholder="Write a quick thought..."
                className={`flex-1 px-3 py-2 text-sm bg-transparent border ${borderColor} rounded-lg outline-none`}
              />
              <button
                onClick={() => {
                  if (newNote.trim()) {
                    setNotes([newNote.trim(), ...notes]);
                    setNewNote('');
                  }
                }}
                className={`p-2 rounded-lg border ${borderColor} ${isLight ? 'hover:bg-neutral-100' : 'hover:bg-neutral-900'}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              {notes.map((note, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${borderColor} text-sm flex items-start justify-between gap-2`}
                >
                  <span>{note}</span>
                  <button
                    onClick={() => setNotes(notes.filter((_, i) => i !== index))}
                    className={`text-xs ${subTextColor} hover:opacity-100`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : appKey.includes('message') || appKey.includes('chat') || appKey.includes('signal') || appKey.includes('whatsapp') ? (
          /* Messages App */
          <div className="flex flex-col h-full">
            <div className="space-y-3 flex-1 overflow-y-auto pb-4">
              {messagesList.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'}`}
                >
                  <span className={`text-[10px] ${subTextColor} mb-1`}>{m.sender}</span>
                  <div
                    className={`px-3 py-2 rounded-2xl max-w-[80%] text-sm ${
                      m.sender === 'You'
                        ? isLight
                          ? 'bg-neutral-900 text-white rounded-br-sm'
                          : 'bg-neutral-100 text-black rounded-br-sm'
                        : isLight
                          ? 'bg-neutral-100 text-neutral-900 rounded-bl-sm'
                          : 'bg-neutral-900 text-neutral-100 rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && messageText.trim()) {
                    setMessagesList([...messagesList, { sender: 'You', text: messageText.trim() }]);
                    setMessageText('');
                  }
                }}
                placeholder="Text message..."
                className={`flex-1 px-3 py-2 text-sm bg-transparent border ${borderColor} rounded-full outline-none`}
              />
              <button
                onClick={() => {
                  if (messageText.trim()) {
                    setMessagesList([...messagesList, { sender: 'You', text: messageText.trim() }]);
                    setMessageText('');
                  }
                }}
                className={`p-2 rounded-full ${isLight ? 'bg-black text-white' : 'bg-white text-black'}`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : appKey.includes('camera') ? (
          /* Camera App */
          <div className="h-full flex flex-col justify-between items-center py-4">
            <div className={`w-full aspect-[4/5] rounded-xl border ${borderColor} relative flex items-center justify-center overflow-hidden bg-neutral-950`}>
              <div className="absolute inset-4 border border-dashed border-neutral-700/50 rounded-lg pointer-events-none flex items-center justify-center">
                <span className="text-neutral-500 font-mono text-xs">VIEWFINDER</span>
              </div>
              <div className="text-center z-10">
                <Sparkles className="w-8 h-8 text-neutral-600 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-neutral-400 font-mono">Monochrome Sensor Standby</p>
              </div>
            </div>
            <div className="flex items-center justify-center w-full pt-4">
              <button
                onClick={() => alert('Photo captured (simulation)')}
                className="w-16 h-16 rounded-full border-4 border-neutral-500 flex items-center justify-center p-1 active:scale-90 transition-transform"
              >
                <div className="w-full h-full rounded-full bg-white" />
              </button>
            </div>
          </div>
        ) : (
          /* Generic App Simulation Screen */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className={`w-16 h-16 rounded-2xl border ${borderColor} flex items-center justify-center font-mono text-2xl`}>
              {getAppDisplayName(app).charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-medium tracking-tight">{getAppDisplayName(app)}</h2>
              {showPackageNames && (
                <p className={`text-xs ${subTextColor} font-mono mt-1`}>{app.packageName}</p>
              )}
            </div>
            <p className={`text-xs ${subTextColor} max-w-xs leading-relaxed`}>
              App launched via Android Component Intent:
              <br />
              <code className="text-[11px] block mt-1 p-1.5 rounded bg-neutral-500/10 font-mono">
                {app.activityName}
              </code>
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className={`px-5 py-2 rounded-full border ${borderColor} text-xs font-mono tracking-wide ${isLight ? 'hover:bg-neutral-100' : 'hover:bg-neutral-900'} transition-colors`}
              >
                Return to Home Screen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Android System Gesture Navigation Pill */}
      <div className="pb-3 pt-1 flex justify-center cursor-pointer" onClick={onClose} title="Swipe or tap to go Home">
        <div className={`w-28 h-1 rounded-full ${isLight ? 'bg-neutral-300' : 'bg-neutral-700'}`} />
      </div>
    </div>
  );
};
