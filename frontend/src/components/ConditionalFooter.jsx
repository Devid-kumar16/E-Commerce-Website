import { useLocation } from "react-router-dom";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const location = useLocation();

  // hide footer on admin pages
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return <Footer />;
}
