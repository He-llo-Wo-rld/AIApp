"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "AI Chat" },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b border-blue-200 z-20 flex items-center justify-center h-14 shadow-sm">
      <div className="flex gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1 rounded font-medium transition-colors duration-150 text-base
              ${
                pathname === link.href
                  ? "bg-blue-500 text-white"
                  : "text-blue-700 hover:bg-blue-100"
              }
            `}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
