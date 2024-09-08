"use client";
import React, { useState } from "react";
import styles from "./page.module.scss";
import Image from "next/image";
import Button from "@/components/Button";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Card from "@/components/Card";


function App({ loggedIn, login }: Readonly<{ loggedIn: boolean; login: () => void }>) {
  const [userType, setUserType] = useState<"borrower" | "investor">("investor");
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

  const myProjects = [
    {
      id: 1,
      title: "Project 1",
      description: "Description 1",
      image: "https://via.placeholder.com/150",
    },
    {
      id: 2,
      title: "Project 2",
      description: "Description 2",
      image: "https://via.placeholder.com/150",
    },
    {
      id: 3,
      title: "Project 3",
      description: "Description 3",
      image: "https://via.placeholder.com/150",
    }
  ];

  const handleTypeUser = (event: any) => {
    setUserType(event.target.value);
  };

  // Render view for logged-in users
  const loggedInView = (
    <div className="">
      <div className="flex-container">
        <div>
          <span>3</span>
          <h2>Active projects</h2>
        </div>
        <div>
          {myProjects.length > 0 ? myProjects.map((project) => <Card key={project.id} element={project} />) : <p>No projects yet</p>}
        </div>
      </div>
    </div>
  );

  // Render view for users not logged in
  const unloggedInView = (
    <div className={styles.container}>
      <Image
        src="/assets/landing-image.jpg"
        alt="Web3Auth Logo"
        width={200}
        height={200}
        className={styles.left_panel}
      />
      <div className={styles.right_panel}>
        <h1>Crowdly</h1>

        <h3>How does it work?</h3>

        <div className={styles.switch}>
          <label className={(userType === "investor" && styles.active) || ""}>
            <input
              id="userType"
              type="radio"
              onChange={handleTypeUser}
              name="userType"
              value="investor"
            />
            Investor
          </label>
          <label className={(userType === "borrower" && styles.active) || ""}>
            <input
              id="userType"
              type="radio"
              onChange={handleTypeUser}
              name="userType"
              value="borrower"
            />
            Borrower
          </label>
        </div>

        <>
          <div className={styles.navigationWrapper}>
            <div ref={sliderRef} className="keen-slider">
              <div className="keen-slider__slide">
                <h3>{userType === "investor" ? "💵" : "📝"}</h3>
                <p>
                  {userType === "investor"
                    ? "Invest on projects"
                    : "Propose your projects"}
                </p>
              </div>
              <div className="keen-slider__slide">
                <h3>{userType === "investor" ? "📜" : "💸"}</h3>
                <p>
                  {userType === "investor"
                    ? "Get tokens as owner of the assets acquired"
                    : "Fund your project"}
                </p>
              </div>
              <div className="keen-slider__slide">
                <h3>{userType === "investor" ? "💰" : "🚛"}</h3>
                <p>
                  {userType === "investor"
                    ? "Get passive income by borrow over your physical assets"
                    : "Pay as you use with complete autonomy"}
                </p>
              </div>
            </div>
          </div>
          {loaded && instanceRef.current && (
            <div className={styles.dots}>
              {Array.from(
                Array(instanceRef.current.track.details.slides.length).keys()
              ).map((idx) => {
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      instanceRef.current?.moveToIdx(idx);
                    }}
                    className={currentSlide === idx ? styles.dotActive : styles.dot}
                  ></button>
                );
              })}
            </div>
          )}
        </>

        <Button text="Start your journey!" onClick={login} />
      </div>
    </div>
  );

  return loggedIn === undefined ? loggedInView : unloggedInView;
}

export default App;
