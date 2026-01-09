import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Timer, Bell, Sun, Moon, Palette, Zap, Clock, StopCircle } from 'lucide-react';

const TabletDashboard = () => {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState('sunset');
  const [darkMode, setDarkMode] = useState(false);
  const [timers, setTimers] = useState([]);
  const [stopwatches, setStopwatches] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [timerInput, setTimerInput] = useState('');
  const [stopwatchInput, setStopwatchInput] = useState('');
  const [reminderInput, setReminderInput] = useState('');
  const [reminderTimeInput, setReminderTimeInput] = useState('');
  const [location, setLocation] = useState('Mumbai');
  const [showNotification, setShowNotification] = useState(null);
  const audioRef = useRef(null);

  const themes = {
    sunset: {
      name: 'Sunset Vibes',
      light: {
        bg: 'linear-gradient(135deg, #FFA07A 0%, #FF6B6B 50%, #FF1493 100%)',
        text: '#FFFFFF',
        card: 'rgba(255, 255, 255, 0.15)',
        accent: '#FFD700',
        animation: 'sunset',
      },
      dark: {
        bg: 'linear-gradient(135deg, #2C1810 0%, #4A1942 50%, #1A0A2E 100%)',
        text: '#FFE4E1',
        card: 'rgba(255, 255, 255, 0.08)',
        accent: '#FF6B9D',
        animation: 'sunset-dark',
      }
    },
    ocean: {
      name: 'Ocean Breeze',
      light: {
        bg: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 50%, #0066FF 100%)',
        text: '#FFFFFF',
        card: 'rgba(255, 255, 255, 0.15)',
        accent: '#00FFFF',
        animation: 'ocean',
      },
      dark: {
        bg: 'linear-gradient(135deg, #001F3F 0%, #002F5F 50%, #001A33 100%)',
        text: '#B3E5FC',
        card: 'rgba(255, 255, 255, 0.08)',
        accent: '#00BCD4',
        animation: 'ocean-dark',
      }
    },
    forest: {
      name: 'Forest Calm',
      light: {
        bg: 'linear-gradient(135deg, #66BB6A 0%, #43A047 50%, #2E7D32 100%)',
        text: '#FFFFFF',
        card: 'rgba(255, 255, 255, 0.15)',
        accent: '#C8E6C9',
        animation: 'forest',
      },
      dark: {
        bg: 'linear-gradient(135deg, #1B5E20 0%, #0D3D14 50%, #051A08 100%)',
        text: '#C8E6C9',
        card: 'rgba(255, 255, 255, 0.08)',
        accent: '#66BB6A',
        animation: 'forest-dark',
      }
    },
    neon: {
      name: 'Neon City',
      light: {
        bg: 'linear-gradient(135deg, #FF006E 0%, #8338EC 50%, #3A86FF 100%)',
        text: '#FFFFFF',
        card: 'rgba(255, 255, 255, 0.15)',
        accent: '#FFBE0B',
        animation: 'neon',
      },
      dark: {
        bg: 'linear-gradient(135deg, #0D0221 0%, #1B0A2B 50%, #0F0326 100%)',
        text: '#FFFFFF',
        card: 'rgba(255, 255, 255, 0.08)',
        accent: '#FF006E',
        animation: 'neon-dark',
      }
    },
    lavender: {
      name: 'Lavender Dream',
      light: {
        bg: 'linear-gradient(135deg, #E8D5FF 0%, #D4A5FF 50%, #C77DFF 100%)',
        text: '#4A148C',
        card: 'rgba(255, 255, 255, 0.25)',
        accent: '#9C27B0',
        animation: 'lavender',
      },
      dark: {
        bg: 'linear-gradient(135deg, #1A0033 0%, #2D1B4E 50%, #1F0A3C 100%)',
        text: '#E1BEE7',
        card: 'rgba(255, 255, 255, 0.08)',
        accent: '#BA68C8',
        animation: 'lavender-dark',
      }
    },
  };

  const currentTheme = themes[theme][darkMode ? 'dark' : 'light'];

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 1000;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.5);
    }, 200);
  };

  const showNotif = (message, type) => {
    playNotificationSound();
    setShowNotification({ message, type });
    setTimeout(() => setShowNotification(null), 5000);
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=19.0760&longitude=72.8777&current=temperature_2m,weathercode&timezone=Asia%2FKolkata`
        );
        const data = await response.json();
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          condition: getWeatherCondition(data.current.weathercode)
        });
      } catch (error) {
        console.error('Weather fetch failed:', error);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 300000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherCondition = (code) => {
    if (code === 0) return '☀️ Clear';
    if (code <= 3) return '⛅ Partly Cloudy';
    if (code <= 67) return '🌧️ Rainy';
    if (code <= 77) return '🌨️ Snowy';
    return '🌤️ Cloudy';
  };

  const addTimer = () => {
    if (timerInput) {
      const minutes = parseInt(timerInput);
      if (minutes > 0) {
        setTimers([...timers, { 
          id: Date.now(), 
          duration: minutes * 60, 
          remaining: minutes * 60,
          originalMinutes: minutes 
        }]);
        setTimerInput('');
      }
    }
  };

  const removeTimer = (id) => {
    setTimers(timers.filter(t => t.id !== id));
  };

  const addStopwatch = () => {
    if (stopwatchInput) {
      const minutes = parseInt(stopwatchInput);
      if (minutes > 0) {
        setStopwatches([...stopwatches, { 
          id: Date.now(), 
          duration: minutes * 60, 
          remaining: minutes * 60,
          originalMinutes: minutes 
        }]);
        setStopwatchInput('');
      }
    }
  };

  const removeStopwatch = (id) => {
    setStopwatches(stopwatches.filter(s => s.id !== id));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers =>
        prevTimers.map(timer => {
          if (timer.remaining > 0) {
            const newRemaining = timer.remaining - 1;
            if (newRemaining === 0) {
              showNotif(`⏰ Timer completed! (${timer.originalMinutes} min)`, 'timer');
            }
            return { ...timer, remaining: newRemaining };
          }
          return timer;
        }).filter(timer => timer.remaining > 0)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStopwatches(prevStopwatches =>
        prevStopwatches.map(stopwatch => {
          if (stopwatch.remaining > 0) {
            const newRemaining = stopwatch.remaining - 1;
            if (newRemaining === 0) {
              showNotif(`⏱️ Stopwatch completed! (${stopwatch.originalMinutes} min)`, 'stopwatch');
            }
            return { ...stopwatch, remaining: newRemaining };
          }
          return stopwatch;
        }).filter(stopwatch => stopwatch.remaining > 0)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addReminder = () => {
    if (reminderInput && reminderTimeInput) {
      const reminderTime = new Date();
      const [hours, minutes] = reminderTimeInput.split(':');
      reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      setReminders([...reminders, { 
        id: Date.now(), 
        text: reminderInput,
        time: reminderTime.getTime(),
        timeString: reminderTimeInput
      }]);
      setReminderInput('');
      setReminderTimeInput('');
    }
  };

  const removeReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setReminders(prevReminders => {
        return prevReminders.filter(reminder => {
          if (now >= reminder.time && now < reminder.time + 60000) {
            showNotif(`🔔 Reminder: ${reminder.text}`, 'reminder');
            return false;
          }
          return true;
        });
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: currentTheme.bg,
        color: currentTheme.text,
        fontFamily: "'Orbitron', 'Space Mono', monospace",
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.5s ease',
      }}
    >
      <div 
        className={`animated-bg ${currentTheme.animation}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.15,
          pointerEvents: 'none',
        }}
      >
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              position: 'absolute',
              width: `${Math.random() * 200 + 30}px`,
              height: `${Math.random() * 200 + 30}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${currentTheme.accent}60, transparent)`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float-particle ${Math.random() * 15 + 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
        
        {currentTheme.animation.includes('ocean') && (
          <>
            <div className="wave wave1"></div>
            <div className="wave wave2"></div>
            <div className="wave wave3"></div>
          </>
        )}
        
        {currentTheme.animation.includes('neon') && (
          [...Array(50)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="star"
              style={{
                position: 'absolute',
                width: '2px',
                height: '2px',
                background: currentTheme.accent,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `twinkle ${Math.random() * 3 + 2}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 3}s`,
                boxShadow: `0 0 ${Math.random() * 10 + 5}px ${currentTheme.accent}`,
              }}
            />
          ))
        )}
      </div>

      {showNotification && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: currentTheme.card,
            backdropFilter: 'blur(30px)',
            padding: '3rem 4rem',
            borderRadius: '30px',
            border: `3px solid ${currentTheme.accent}`,
            boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 0 2px ${currentTheme.accent}40`,
            zIndex: 10000,
            animation: 'popup-bounce 0.5s ease-out',
            textAlign: 'center',
            minWidth: '400px',
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {showNotification.type === 'timer' && '⏰'}
            {showNotification.type === 'stopwatch' && '⏱️'}
            {showNotification.type === 'reminder' && '🔔'}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: '1.4' }}>
            {showNotification.message}
          </div>
          <button
            onClick={() => setShowNotification(null)}
            style={{
              marginTop: '2rem',
              padding: '1rem 3rem',
              background: currentTheme.accent,
              border: 'none',
              borderRadius: '15px',
              color: darkMode ? '#000' : '#fff',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Got it!
          </button>
        </div>
      )}

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          background: currentTheme.card,
          backdropFilter: 'blur(20px)',
          border: 'none',
          borderRadius: '20px',
          padding: '1rem',
          cursor: 'pointer',
          zIndex: 1000,
          color: currentTheme.text,
          transition: 'all 0.3s ease',
        }}
      >
        {menuOpen ? <X size={32} /> : <Menu size={32} />}
      </button>

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: menuOpen ? 0 : '-450px',
          width: '450px',
          height: '100vh',
          background: currentTheme.card,
          backdropFilter: 'blur(30px)',
          padding: '2rem',
          overflowY: 'auto',
          transition: 'right 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          zIndex: 999,
          boxShadow: '-10px 0 30px rgba(0,0,0,0.3)',
        }}
      >
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={28} color={currentTheme.accent} /> Settings
        </h2>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Palette size={20} /> Theme
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {Object.keys(themes).map((themeKey) => (
              <button
                key={themeKey}
                onClick={() => setTheme(themeKey)}
                style={{
                  padding: '0.8rem',
                  background: theme === themeKey ? currentTheme.accent : 'rgba(255,255,255,0.1)',
                  border: `2px solid ${theme === themeKey ? currentTheme.accent : 'transparent'}`,
                  borderRadius: '12px',
                  color: currentTheme.text,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.9rem',
                }}
              >
                {themes[themeKey].name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              width: '100%',
              padding: '1rem',
              background: currentTheme.accent,
              border: 'none',
              borderRadius: '12px',
              color: darkMode ? '#000' : '#fff',
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
            }}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <StopCircle size={20} /> Stopwatch
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="number"
              value={stopwatchInput}
              onChange={(e) => setStopwatchInput(e.target.value)}
              placeholder="Minutes"
              style={{
                flex: 1,
                padding: '0.8rem',
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: currentTheme.text,
                fontSize: '1rem',
              }}
            />
            <button
              onClick={addStopwatch}
              style={{
                padding: '0.8rem 1.5rem',
                background: currentTheme.accent,
                border: 'none',
                borderRadius: '12px',
                color: darkMode ? '#000' : '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Add
            </button>
          </div>
          {stopwatches.map(stopwatch => (
            <div
              key={stopwatch.id}
              style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                marginBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                ⏱️ {formatTime(stopwatch.remaining)}
              </span>
              <button
                onClick={() => removeStopwatch(stopwatch.id)}
                style={{
                  background: 'rgba(255,0,0,0.5)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Timer size={20} /> Timer
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="number"
              value={timerInput}
              onChange={(e) => setTimerInput(e.target.value)}
              placeholder="Minutes"
              style={{
                flex: 1,
                padding: '0.8rem',
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: currentTheme.text,
                fontSize: '1rem',
              }}
            />
            <button
              onClick={addTimer}
              style={{
                padding: '0.8rem 1.5rem',
                background: currentTheme.accent,
                border: 'none',
                borderRadius: '12px',
                color: darkMode ? '#000' : '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Add
            </button>
          </div>
          {timers.map(timer => (
            <div
              key={timer.id}
              style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                marginBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                ⏰ {formatTime(timer.remaining)}
              </span>
              <button
                onClick={() => removeTimer(timer.id)}
                style={{
                  background: 'rgba(255,0,0,0.5)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Bell size={20} /> Reminders
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={reminderInput}
              onChange={(e) => setReminderInput(e.target.value)}
              placeholder="Reminder text"
              style={{
                width: '100%',
                padding: '0.8rem',
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: currentTheme.text,
                fontSize: '1rem',
                marginBottom: '0.5rem',
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="time"
                value={reminderTimeInput}
                onChange={(e) => setReminderTimeInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: currentTheme.text,
                  fontSize: '1rem',
                }}
              />
              <button
                onClick={addReminder}
                style={{
                  padding: '0.8rem 1.5rem',
                  background: currentTheme.accent,
                  border: 'none',
                  borderRadius: '12px',
                  color: darkMode ? '#000' : '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Add
              </button>
            </div>
          </div>
          {reminders.map(reminder => (
            <div
              key={reminder.id}
              style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                marginBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>{reminder.text}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>🕐 {reminder.timeString}</div>
              </div>
              <button
                onClick={() => removeReminder(reminder.id)}
                style={{
                  background: 'rgba(255,0,0,0.5)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '2rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {weather && (
          <div
            style={{
              position: 'fixed',
              top: '2rem',
              left: '2rem',
              background: currentTheme.card,
              backdropFilter: 'blur(20px)',
              padding: '1.5rem 2.5rem',
              borderRadius: '25px',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              border: `2px solid ${currentTheme.accent}30`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px ${currentTheme.accent}20`,
              zIndex: 100,
            }}
          >
            <div style={{ fontSize: '3rem' }}>
              {weather.condition.split(' ')[0]}
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>
                {weather.temp}°C
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.8 }}>
                {weather.condition.split(' ').slice(1).join(' ')}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.6, marginTop: '0.3rem' }}>
                Mumbai, India
              </div>
            </div>
          </div>
        )}

        {stopwatches.length > 0 ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 'clamp(6rem, 14vw, 11rem)',
                fontWeight: '900',
                letterSpacing: '0.05em',
                textShadow: `0 0 50px ${currentTheme.accent}FF, 0 0 100px ${currentTheme.accent}80`,
                marginBottom: '2rem',
                animation: 'glow 2s ease-in-out infinite alternate',
                color: currentTheme.accent,
              }}
            >
              ⏱️ {formatTime(stopwatches[0].remaining)}
            </div>
            
            <div
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: '700',
                letterSpacing: '0.05em',
                opacity: 0.7,
                marginBottom: '1rem',
		whiteSpace: 'nowrap',
              }}
            >
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).replace(' ', '\u00A0')}
            </div>
            
            <div
              style={{
                fontSize: 'clamp(1.2rem, 2.5vw, 2rem)',
                opacity: 0.8,
                fontWeight: '500',
                letterSpacing: '0.1em',
              }}
            >
              {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: 'clamp(4rem, 12vw, 9rem)',
                fontWeight: '900',
                letterSpacing: '0.05em',
                textShadow: `0 0 40px ${currentTheme.accent}80, 0 0 80px ${currentTheme.accent}40`,
                marginBottom: '2rem',
                animation: 'glow 2s ease-in-out infinite alternate',
		whiteSpace: 'nowrap',
              }}
            >
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).replace(' ', '\u00A0')}
            </div>

            <div
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                marginBottom: '3rem',
                opacity: 0.9,
                fontWeight: '500',
                letterSpacing: '0.1em',
              }}
            >
              {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </>
        )}
      </div>

      {timers.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '1rem',
            zIndex: 100,
          }}
        >
          {timers.map(timer => (
            <div
              key={timer.id}
              style={{
                background: currentTheme.card,
                backdropFilter: 'blur(20px)',
                padding: '1.5rem 3rem',
                borderRadius: '25px',
                border: `2px solid ${currentTheme.accent}`,
                boxShadow: `0 10px 40px rgba(0,0,0,0.3)`,
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div style={{ fontSize: '2rem' }}>⏰</div>
              <div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.3rem' }}>
                  Timer
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: currentTheme.accent }}>
                  {formatTime(timer.remaining)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Space+Mono:wght@400;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @keyframes float-particle {
          0%, 100% { 
            transform: translate(0, 0) scale(1) rotate(0deg); 
            opacity: 0.6;
          }
          25% { 
            transform: translate(50px, -80px) scale(1.2) rotate(90deg); 
            opacity: 0.8;
          }
          50% { 
            transform: translate(-30px, 40px) scale(0.8) rotate(180deg); 
            opacity: 0.5;
          }
          75% { 
            transform: translate(70px, 60px) scale(1.1) rotate(270deg); 
            opacity: 0.7;
          }
        }
        
        @keyframes glow {
          from { 
            text-shadow: 0 0 40px ${currentTheme.accent}80, 0 0 80px ${currentTheme.accent}40; 
          }
          to { 
            text-shadow: 0 0 60px ${currentTheme.accent}FF, 0 0 120px ${currentTheme.accent}60; 
          }
        }

        @keyframes popup-bounce {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        .wave {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 200%;
          height: 200px;
          background: linear-gradient(transparent, ${currentTheme.accent}20);
          border-radius: 1000px 1000px 0 0;
        }

        .wave1 {
          animation: wave-animation 15s linear infinite;
        }

        .wave2 {
          animation: wave-animation 20s linear infinite;
          opacity: 0.5;
          bottom: 50px;
        }

        .wave3 {
          animation: wave-animation 25s linear infinite;
          opacity: 0.3;
          bottom: 100px;
        }

        @keyframes wave-animation {
          0% { transform: translateX(0) translateZ(0) scaleY(1); }
          50% { transform: translateX(-25%) translateZ(0) scaleY(0.8); }
          100% { transform: translateX(-50%) translateZ(0) scaleY(1); }
        }

        .animated-bg.sunset .particle,
        .animated-bg.sunset-dark .particle {
          filter: hue-rotate(20deg);
        }

        .animated-bg.ocean .particle,
        .animated-bg.ocean-dark .particle {
          filter: hue-rotate(180deg);
        }

        .animated-bg.forest .particle,
        .animated-bg.forest-dark .particle {
          filter: hue-rotate(100deg);
        }

        .animated-bg.neon .particle,
        .animated-bg.neon-dark .particle {
          filter: hue-rotate(270deg) saturate(2);
        }

        .animated-bg.lavender .particle,
        .animated-bg.lavender-dark .particle {
          filter: hue-rotate(280deg);
        }

        input::placeholder {
          color: ${currentTheme.text}60;
        }

        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }

        button:hover {
          transform: scale(1.05);
          filter: brightness(1.2);
        }

        button:active {
          transform: scale(0.95);
        }

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: ${currentTheme.accent};
          border-radius: 10px;
        }

        ${showNotification ? `
          body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(10px);
            z-index: 9999;
          }
        ` : ''}
      `}</style>
    </div>
  );
};

export default TabletDashboard; 
