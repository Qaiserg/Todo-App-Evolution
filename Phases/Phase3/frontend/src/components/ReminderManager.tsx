'use client';

import { useEffect, useRef, useState } from 'react';
import { Task } from '@/lib/types';
import { taskApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface ReminderManagerProps {
  tasks: Task[];
  onTasksUpdated: () => void;
}

export default function ReminderManager({ tasks, onTasksUpdated }: ReminderManagerProps) {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reminderCheckRef = useRef<NodeJS.Timeout | null>(null);
  const stopBeepRef = useRef<boolean>(false);
  const triggeredRemindersRef = useRef<Set<number>>(new Set()); // Track triggered reminders
  const hasRequestedPermissionRef = useRef<boolean>(false); // Track permission request

  // Request notification permission on mount
  useEffect(() => {
    const requestPermission = async () => {
      if ('Notification' in window && !hasRequestedPermissionRef.current) {
        hasRequestedPermissionRef.current = true; // Mark as requested
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);

        if (permission === 'granted') {
          console.log('[Reminder] Notification permission granted');
          toast.success('🔔 Reminder notifications enabled!');
        } else if (permission === 'denied') {
          console.warn('[Reminder] Notification permission denied');
          toast.error('Reminder notifications blocked. Please enable in browser settings.');
        }
      } else {
        console.warn('[Reminder] Notifications not supported');
      }
    };

    requestPermission();
  }, []);

  // Using browser beep for alarms (no MP3 file needed)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('[Reminder] Alarm system initialized with browser beep');
    }
  }, []);

  // Generate alarm beep using Web Audio API (fallback)
  const playBeep = () => {
    if (typeof window === 'undefined') return;

    try {
      const audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      stopBeepRef.current = false; // Reset stop flag

      // Create a repeating beep pattern
      const playBeepSequence = (count: number) => {
        // Stop if user dismissed or count reached zero
        if (count <= 0 || stopBeepRef.current) {
          console.log('[Reminder] Beep sequence stopped');
          return;
        }

        // Create oscillator for beep sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Beep sound settings
        oscillator.frequency.value = 800; // 800 Hz tone
        oscillator.type = 'sine';

        // Volume envelope (fade in/out for smoother sound)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.2);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.25);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.25);

        // Repeat beep after 0.5 seconds
        if (count > 1 && !stopBeepRef.current) {
          setTimeout(() => playBeepSequence(count - 1), 500);
        }
      };

      // Play 20 beeps (10 seconds total)
      playBeepSequence(20);
      console.log('[Reminder] Playing browser beep sound');
    } catch (error) {
      console.error('[Reminder] Failed to play beep:', error);
    }
  };

  // Trigger alarm function
  const triggerAlarm = async (task: Task) => {
    console.log(`[Reminder] Triggering alarm for task: ${task.title}`);

    // 1. Show browser notification
    if (notificationPermission === 'granted') {
      const notification = new Notification('⏰ Reminder!', {
        body: `Time to: ${task.title}`,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: `reminder-${task.id}`,
        requireInteraction: true, // Keeps notification until user clicks
        vibrate: [200, 100, 200], // Vibrate pattern for mobile
      });

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
        stopAlarm();
      };
    }

    // 2. Play alarm sound (MP3 or browser beep fallback)
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        console.log('[Reminder] MP3 alarm sound playing');

        // Auto-stop after 30 seconds
        setTimeout(() => stopAlarm(), 30000);
      } catch {
        console.log('[Reminder] MP3 failed, using browser beep fallback');
        playBeep();
      }
    } else {
      // No audio element, use browser beep
      playBeep();
    }

    // 3. Show toast notification
    toast.custom(
      (toastInstance) => (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-lg shadow-2xl max-w-md animate-bounce">
          <div className="flex items-center gap-4">
            <div className="text-4xl">⏰</div>
            <div className="flex-1">
              <div className="font-bold text-lg mb-1">Reminder!</div>
              <div className="text-sm opacity-90">{task.title}</div>
            </div>
            <button
              onClick={() => {
                toast.dismiss(toastInstance.id);
                stopAlarm();
              }}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // Don't auto-dismiss
        position: 'top-center',
      }
    );

    // 4. Mark task as reminded in backend
    try {
      await taskApi.markReminded(task.id);
      console.log(`[Reminder] Marked task ${task.id} as reminded`);
      onTasksUpdated();
    } catch (error) {
      console.error('[Reminder] Failed to mark task as reminded:', error);
    }
  };

  // Stop alarm function
  const stopAlarm = () => {
    // Stop MP3 if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Stop browser beep if playing
    stopBeepRef.current = true;

    console.log('[Reminder] Alarm stopped');
  };

  // Watchman - Check reminders every 15 seconds
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();

      tasks.forEach((task) => {
        // Only trigger if:
        // 1. Task has a reminder_time set
        // 2. Reminder time has passed
        // 3. Task hasn't been reminded yet (in DB or locally)
        // 4. Task is still pending (not completed)
        // 5. Not already triggered in this session
        if (
          task.reminder_time &&
          new Date(task.reminder_time) <= now &&
          !task.is_reminded &&
          task.status === 'pending' &&
          !triggeredRemindersRef.current.has(task.id)
        ) {
          console.log(`[Reminder] ⏰ Alarm triggered for: "${task.title}"`);
          triggeredRemindersRef.current.add(task.id); // Prevent duplicate triggers
          triggerAlarm(task);
        }
      });
    };

    // Check immediately on mount
    checkReminders();

    // Then check every 15 seconds
    reminderCheckRef.current = setInterval(checkReminders, 15000);

    return () => {
      if (reminderCheckRef.current) {
        clearInterval(reminderCheckRef.current);
      }
    };
  }, [tasks, notificationPermission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAlarm();
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}
