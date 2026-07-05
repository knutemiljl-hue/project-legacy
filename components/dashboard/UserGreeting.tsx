"use client";

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
    <div className="flex items-center gap-4">
      <div className="grid h-12 w-12 place-items-center rounded-3xl bg-[#EEF5E8] text-2xl text-[#4F773D]">
        ❦
      </div>

      <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#24312A]">
        God kveld, {activeUser.name}.
      </h1>
    </div>
  );
}