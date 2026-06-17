import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// 1 hour in ms (3,600,000 ms)
const INACTIVITY_TIMEOUT = 3600000;
// 10 seconds throttle for updating localStorage
const ACTIVITY_THROTTLE = 10000;

export default function ActiveSessionTracker() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) return;

    // Set initial lastActiveTime if it doesn't exist
    if (!localStorage.getItem("lastActiveTime")) {
      localStorage.setItem("lastActiveTime", Date.now().toString());
    }

    let lastStoredTime = parseInt(localStorage.getItem("lastActiveTime") || "0", 10);

    const updateActivity = () => {
      const now = Date.now();
      // Only write to localStorage if it's been more than ACTIVITY_THROTTLE ms since the last write
      if (now - lastStoredTime > ACTIVITY_THROTTLE) {
        localStorage.setItem("lastActiveTime", now.toString());
        lastStoredTime = now;
      }
    };

    // Events to listen to for user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    // Attach event listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Periodic check every 10 seconds
    const interval = setInterval(() => {
      const lastActive = localStorage.getItem("lastActiveTime");
      const currentAuth = localStorage.getItem("isAuthenticated") === "true";

      if (currentAuth && lastActive) {
        const inactiveDuration = Date.now() - parseInt(lastActive, 10);
        if (inactiveDuration > INACTIVITY_TIMEOUT) {
          // Inactive for more than 1 hour -> Logout
          localStorage.clear();
          clearInterval(interval);
          navigate("/login", { replace: true });
        }
      }
    }, 10000); // Check every 10 seconds

    return () => {
      // Clean up event listeners and interval
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(interval);
    };
  }, [navigate, location.pathname]);

  return null;
}
