import React from 'react';
import { useEcosystem } from '../context/EcosystemContext.tsx';
import { X, CheckCircle2, Info, AlertTriangle, Smartphone, MessageSquare } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { notifications, dismissNotification } = useEcosystem();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map(notif => {
        const iconMap = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
          info: <Info className="w-4 h-4 text-cyan-400 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
          device: <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />,
          message: <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
        };

        const borderMap = {
          success: 'border-emerald-500/20 bg-slate-900/95 text-slate-100',
          info: 'border-cyan-500/20 bg-slate-900/95 text-slate-100',
          warning: 'border-amber-500/20 bg-slate-900/95 text-slate-100',
          device: 'border-blue-500/20 bg-slate-900/95 text-slate-100',
          message: 'border-indigo-500/20 bg-slate-900/95 text-slate-100'
        };

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${borderMap[notif.type]}`}
          >
            <div className="mt-0.5">{iconMap[notif.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-200 truncate">{notif.title}</p>
                <span className="text-[10px] text-slate-500 tabular-nums shrink-0">{notif.timestamp}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
            </div>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors shrink-0"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
