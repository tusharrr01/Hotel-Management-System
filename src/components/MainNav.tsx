import { Button } from "./ui/button";
import UsernameMenu from "./UsernameMenu";
import { Link } from "react-router-dom";
import useAppContext from "../hooks/useAppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown, FileText, Activity, LayoutDashboard } from "lucide-react";
import { getHotelsSearchUrl } from "../lib/nav-utils";

const NAV_AUTH_WIDTH = "min-w-[120px]";

const navLinkClass =
  "flex items-center text-white/90 hover:text-white px-4 py-2 rounded-lg font-medium hover:bg-white/10 transition-all duration-200";

const MainNav = () => {
  const { isLoggedIn, userRole } = useAppContext();

  return (
    <nav className="flex items-center gap-1 lg:gap-2">
      <Link to={getHotelsSearchUrl()} className={navLinkClass}>
        Hotels
      </Link>
      <Link to="/my-bookings" className={navLinkClass}>
        My Bookings
      </Link>

      {/* Show Business Insights link only for Hotel Owners and Admins */}
      {(userRole === "hotel_owner" || userRole === "admin") && (
        <Link to="/business-insights" className={navLinkClass}>
          Business Insights
        </Link>
      )}

      {/* Show My Hotels link only for Hotel Owners */}
      {userRole === "hotel_owner" && (
        <Link to="/my-hotels" className={navLinkClass}>
          My Hotels
        </Link>
      )}

      {/* Show Admin Dashboard link only for Admins */}
      {userRole === "admin" && (
        <Link to="/admin/dashboard" className={navLinkClass}>
          <LayoutDashboard className="h-4 w-4 mr-1" />
          Admin
        </Link>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`${navLinkClass} flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-primary-600 rounded-lg`}
          >
            API
            <ChevronDown className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white">
          <DropdownMenuItem asChild>
            <Link
              to="/api-docs"
              className="flex items-center gap-2 cursor-pointer text-gray-900"
            >
              <FileText className="h-4 w-4" />
              API Docs
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              to="/api-status"
              className="flex items-center gap-2 cursor-pointer text-gray-900"
            >
              <Activity className="h-4 w-4" />
              API Status
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className={`flex items-center justify-end gap-2 ${NAV_AUTH_WIDTH}`}>
        {isLoggedIn ? (
          <UsernameMenu />
        ) : (
          <>
            <Link to="/admin/login">
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 text-sm px-2"
                title="Admin Portal"
              >
                🔐
              </Button>
            </Link>
            <Link to="/sign-in">
              <Button
                variant="ghost"
                className="font-bold bg-white text-primary-600 hover:bg-primary-50 hover:text-primary-700 border-2 border-white/80"
              >
                Log In
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default MainNav;