import { useEffect } from "react";
import useAuthStore from "./useAuthStore";
 
export default function AuthProvider({ children }) {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const session = useAuthStore((s) => s.session);
 
  useEffect(() => {
    // If there's a stored token, silently fetch the user profile on every load.
    // If the token is expired or invalid, fetchMe() calls logout() automatically.
    if (session?.access_token) {
      fetchMe();
    }
  }, []); // run once on mount
 
  return children;
}
 