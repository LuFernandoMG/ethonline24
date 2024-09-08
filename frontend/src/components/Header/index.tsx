"use client";
import Image from "next/image";
import { useState } from "react";
import style from "./Header.module.scss";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { RxTextAlignJustify } from "react-icons/rx";
import Button from "../Button";

type HeaderProps = {
  loggedIn: boolean;
  login: () => void;
  logout: () => void;
};

const Header: React.FC<HeaderProps> = ({ loggedIn, login, logout }) => {
  const [active, setActive] = useState(false);
  const path = usePathname();

  const handleMenu = () => {
    setActive(!active);
  };

  return (
    <header className={`${style.header} ${path !== "/" && style.light}`}>
      <div className={style.logo}>
        <Link href="/">
          <Image src="/assets/logo.png" alt="Logo" width={100} height={100} />
        </Link>
      </div>
      <button onClick={handleMenu} className={style.responsiveButton}>
        <RxTextAlignJustify />
      </button>
      <nav className={`${active && style.active}`}>
        <ul>
          {loggedIn ? (
            <>
              <li>
                <Link href="/discover">Discover</Link>
              </li>
              <li>
                <Link href="/new-project">New Project</Link>
              </li>
              <li>
                <Button text="Log out" onClick={logout} />
              </li>
            </>
          ) : (
            <>
              <li>
                <Button onClick={login} text="Log in" />
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
