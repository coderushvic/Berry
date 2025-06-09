import React from "react";
import { FaGamepad } from "react-icons/fa"; // Import the gamepad icon
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const GameButton = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleStartClick = () => {
    navigate("/GameComponent"); // Navigate to the ColorSwitchGame page
  };

  return (
    <div className="flex visible relative items-center gap-4 rounded-lg border p-3">
      <div className="grid grow gap-1.5">
        {/* Icon placed above the text */}
        <div className="flex justify-center">
          <FaGamepad className="text-5xl text-green-500" /> {/* Larger and green icon */}
        </div>

        <span className="font-medium leading-tight text-black text-center">
          Color Switch Game:
        </span>
        <div className="flex items-center gap-2 justify-center">
          <span className="text-sm font-medium text-black">
            Adventure Awaits
          </span>
          <span className="h-5 w-px bg-border bg-slate-200"></span>

          <button
            onClick={handleStartClick}
            className="inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground px-3 text-sm h-7 w-16 rounded-full text-white hover:bg-slate-400 bg-black"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameButton;