import type { ReactNode } from "react";
import { MdOutlineTableBar } from "react-icons/md";
import { ItemLink } from "./ItemLink";
import { FaUser } from "react-icons/fa";

export interface Section {
  name: string;
  link: string;
  icon: ReactNode
}

const SECTIONS: Section[] = [
  {
    name: "Mesas",
    link: "/",
    icon: <MdOutlineTableBar />
  }
]

export function AsideNav() {

  return (
    <aside className="flex flex-col gap-5 bg-background text-foreground min-w-56 px-2 py-4">
      <section>
        <div className="flex items-center gap-2 px-2">
          <div className="border-2 rounded-full p-2">
            <FaUser />
          </div>
          <span>Diego Salazar</span>
        </div>
      </section>
      <nav className="flex flex-col gap-2">
        {SECTIONS.map(item => (
          <ItemLink key={item.link} item={item} />
        ))}
      </nav>
    </aside>
  )
}
