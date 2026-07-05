"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { legacyUsers, readActiveUser } from "@/lib/users";

export default function UserGreeting() {
  const [activeUser, setActiveUser] = useState(legacyUsers[0]);

  useEffect(() => {
    function updateActiveUser() {
      setActiveUser(readActiveUser());
    }

    updateActiveUser();

    window.addEventListener(
      "project-legacy-active-user-updated",
      updateActiveUser
    );
    window.addEventListener("storage", updateActiveUser);

    return () => {
      window.removeEventListener(
        "project-legacy-active-user-updated",
        updateActiveUser
      );
      window.removeEventListener("storage", updateActiveUser);
    };
  }, []);

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[2.25rem] border border-[#E2D8C7] bg-white shadow-sm ring-1 ring-black/5">
        <Image
          src={activeUser.avatar}
          alt={`Avatar for ${activeUser.name}`}
          fill
          priority
          sizes="112px"
          className="object-cover"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-[#8D846F]">Oversikt</p>

        <h1 className="font-serif text-5xl font-semibold tracking-tight text-[#24312A]">
          Hei, {activeUser.name}.
        </h1>
      </div>
    </div>
  );
}