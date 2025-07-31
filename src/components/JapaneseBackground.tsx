import React from 'react';

const JapaneseBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <style>
        {`
          @keyframes sakura-fall {
            0% { transform: translateY(-20vh) rotate(0deg); opacity: 0.9; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0.2; }
          }
          .sakura-petal {
            position: absolute;
            width: 12px;
            height: 12px;
            background: radial-gradient(circle, #ffb7c5 40%, #ff87b2 70%, transparent);
            clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
            animation: sakura-fall 8s linear infinite;
          }
          .animation-delay-2s { animation-delay: 2s; }
          .animation-delay-4s { animation-delay: 4s; }
          .animation-delay-6s { animation-delay: 6s; }
          .animation-delay-8s { animation-delay: 8s; }
          @keyframes wave {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-wave { animation: wave 2s ease-in-out infinite; }
        `}
      </style>
      <div className="sakura-petal left-[10%] top-[-10%]"></div>
      <div className="sakura-petal left-[30%] top-[-20%] animation-delay-2s"></div>
      <div className="sakura-petal left-[50%] top-[-15%] animation-delay-4s"></div>
      <div className="sakura-petal left-[70%] top-[-25%] animation-delay-6s"></div>
      <div className="sakura-petal left-[90%] top-[-10%] animation-delay-8s"></div>
      <svg className="absolute bottom-0 w-full h-16 text-blue-200 dark:text-blue-900" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path
          d="M0,60 C200,80 300,20 500,40 C700,60 900,20 1100,40 C1300,60 1440,20 1440,60 L1440,100 L0,100 Z"
          fill="currentColor"
          className="animate-wave"
        />
      </svg>
    </div>
  );
};

export default JapaneseBackground;
