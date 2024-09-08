import styles from "./Modal.module.scss";
import Image from "next/image";
import Link from "next/link";
import { FaXmark } from "react-icons/fa6";
import InvestButton from "../InvestButton";

type ModalProps = {
  id: string;
};

const fetchData = ({ endpoint }: { endpoint: string }) => console.log("Fetching data...", endpoint);

const Modal: React.FC<ModalProps> = async ({ id }) => {
  const element = await fetchData({ endpoint: `/${id}` });

  return (
    <div className={styles.modal_wrapper}>
      <div className={styles.modal_container}>
        <div className={styles.modal_header}>
          <Image
            src="/assets/placeholder.png"
            width={750}
            height={420}
            alt="holva vale"
          />
          <div className={styles.img_gradient} />
          <div className={styles.header_info}>
            <>
              {/* <h3 className={styles.modal_title}>{element.name}</h3> */}
            </>
          </div>
          <div className={styles.close}>
            <Link href="/" scroll={false}>
              <FaXmark />
            </Link>
          </div>
        </div>
        <div className={styles.modal_body}>
          <div className={styles.description_container}>
            <h4>Description</h4>
            {/* <p className={styles.description}>{element.overview}</p> */}
          </div>
          <div className={styles.general_information}>
            <div className={styles.details}>
              <h4>
                {/* {type === "movie" ? "Release date" : "First transmission"} */}
              </h4>
              <p>
                {/* {type === "movie"
                  ? element.release_date
                  : element.first_air_date} */}
              </p>
            </div>
            <div className={styles.details}>
              <h4>Rating</h4>
              {/* <p>{`${Number(element.vote_average).toFixed(1)}/10`}</p> */}
            </div>
            <div className={styles.details}>
              {/* <h4>{type === "movie" ? "Runtime" : "Episodes"}</h4> */}
              <p>
                {/* {type === "movie"
                  ? `${element.runtime} min`
                  : `${element.number_of_episodes} episodes`} */}
              </p>
            </div>
            <div className={styles.icons}>
              <InvestButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
