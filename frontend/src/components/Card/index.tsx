import Image from "next/image";
import styles from "./Card.module.scss";
import { FaInfo } from "react-icons/fa6";
import Link from "next/link";
import InvestButton from "../InvestButton";

interface CardProps {
  element: any;
  className?: string;
  clean?: boolean;
  root?: string;
}

const Card: React.FC<CardProps> = ({ element, clean, root }) => {
  return (
    <div
      className={`${clean ? styles.card : `${styles.card} keen-slider__slide`}`}
      style={{ overflow: "visible" }}
      id="card"
    >
      <div className={styles.card__container}>
        {element && element.backdrop_path && (
          <Image
            src={`${element.backdrop_path ? `https://image.tmdb.org/t/p/w500${element.backdrop_path}` : "@/public/assets/placeholder.png"}`}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
            alt={element?.title}
          />
        )}
        <div className={styles.cardHovered__info}>
          <h3>{element.title}</h3>
          <p className={styles.score}>
            {`Raised: ${element?.raised?.toFixed(1)}/${element?.goal?.toFixed(1)} ETH`}
          </p>
          <div className={styles.icons}>
            <Link
              href={`?show=true&id=${element.id}`}
              scroll={false}
            >
              <FaInfo />
            </Link>
            <InvestButton sm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
