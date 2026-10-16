import { useEffect } from "react";
import { useLocation } from "react-router";

// React Router keeps the scroll position between pages, this resets it on page change
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
